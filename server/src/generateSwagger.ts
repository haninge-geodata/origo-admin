import {
  Project,
  SourceFile,
  SyntaxKind,
  Node,
  InterfaceDeclaration,
  Type,
  TypeFlags,
} from "ts-morph";
import * as fs from "fs";
import * as path from "path";
//import * as ts from "typescript";
import * as dotenv from "dotenv";

// Read environment variables
const envPath = path.resolve(__dirname, "..", `.env`)
console.info(`[${new Date().toISOString()}] Initializing environment (${envPath})...`);
dotenv.config({ path: envPath });

const project = new Project();

// Add your source files
project.addSourceFilesAtPaths("src/**/*.ts");
project.addSourceFilesAtPaths("../shared/interfaces/dtos/**/*.ts");

// Log all file paths
project.getSourceFiles().forEach((file) => {});

const swaggerDocs: any = {
  openapi: "3.0.0",
  info: {
    title: "Your API",
    description:
      "This API allows you to manage favorite items.\n\nUsage Guidelines:\n1. Use GET requests to retrieve data.\n2. Use POST requests to create new items. When creating a new item, do not include an 'id' field in the request body. The server will generate and assign an ID automatically.\n3. Use PUT requests to update existing items. Include the item's ID in the URL path, not in the request body.\n4. Use DELETE requests to remove items.\n\nAuthentication:\nAll requests require a valid API key to be included in the header.\n\nFor detailed information on request and response formats, please refer to the schema definitions and endpoint descriptions below.",
    version: "1.0.0",
  },
  tags: [],
  paths: {},
  components: {
    schemas: {},
  },
};

function parseRouteString(routeString: string | undefined, routeName: string) : string {
  if (routeString) {
    return routeString
      // Remove quotation marks
      .replace(/['"``]/g, "")
      // Remove the request method if present
      .replace(/get |post |put |delete /ig, "")
      // Replace ${route} with the actual route name
      .replace(/\$\{route\}/g, routeName || "{route}")
      // Handle other template literals
      .replace(/\$\{([^}]+)\}/g, (_, g) => `{${g}}`)
      // Replace :param with {param}
      .replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, "{$1}")
      // Remove regex sections that restrict param values
      .replace(/(\})(\(.*?\)([/]|$))/g, "$1$3")
      // Remove regex sections that add optional path sections
      .replace(/(\(.*?\)[?]([/]|$))/g, "$2")
      // Add leading slash if missing
      .replace(/^([^/])/g, "/{$1}");
  }
  return '';
}

function parseJSDocCommentString(jsDocComment: string | undefined, routeName: string |undefined): { [key: string]: string[] } {
  if (!jsDocComment) return {};

  const lines = jsDocComment.split("\n");
  const result: { [key: string]: string[] } = {};

  let currentTag = "";
  lines.forEach((line) => {
    line = line.trim().replace(/^\*\s*/, "");
    const match = line.match(/@(\w+)\s+(.*)/);
    if (match) {
      const [, tag, content] = match;
      currentTag = tag;
      if (!result[tag]) result[tag] = [];
      if (tag === "route") {
        (result[tag] as string[]).push(parseRouteString(content.trim(), routeName || "{route}"));
      } else {
        (result[tag] as string[]).push(content.trim());
      }
    } else if (currentTag && line) {
      (result[currentTag] as string[]).push(line.trim());
    }
  });

  return result;
}

function extractRouteInfo(node: Node, routeName: string) {
  if (Node.isCallExpression(node)) {
    const expression = node.getExpression();
    if (Node.isPropertyAccessExpression(expression)) {
      const method = expression.getName().toLowerCase();
      if (["get", "post", "put", "delete"].includes(method)) {
        const args = node.getArguments();
        if (args.length >= 2) {
          const pathArg = args[0];
          let path = parseRouteString(pathArg.getText(), routeName);

          // Parse JSDoc comment
          const jsDocComment = node
            .getParent()
            ?.getLeadingCommentRanges()
            .find(
              (comment) =>
                comment.getKind() === SyntaxKind.MultiLineCommentTrivia
            )
            ?.getText();
          const jsDocInfoParams = parseJSDocCommentString(jsDocComment, routeName);
          // Create tag from routeName
          const tag = routeName.charAt(0).toUpperCase() + routeName.slice(1);

          const parameters =
            path.match(/\{[A-Z_][A-Z0-9_]*\}/ig)?.map((param) => {
              const paramName = param.slice(1, -1);
              const paramInfo =
                (jsDocInfoParams.param as string[])?.find((p) =>
                  p.includes(paramName)
                ) || "";
              const [paramType, ...paramDescParts] = paramInfo
                .split("-")
                .map((s) => s.trim());
              const paramDesc = paramDescParts.join("-").trim();
              return {
                name: paramName,
                in: "path",
                required: true,
                schema: {
                  type: paramType
                    .replace(/[{}]/g, "")
                    .toLowerCase()
                    .split(" ")[0],
                },
                description: paramDesc,
              };
            }) || [];

          swaggerDocs.paths[path] = swaggerDocs.paths[path] || {};
          
          // Find out if the (first) return object is an array and set the response content schema accordingly
          const firstReturn = jsDocInfoParams.returns?.[0] || "";
          const schemaReference = jsDocInfoParams.returns ? `#/components/schemas/${firstReturn.replace(/[\[\]{}*\/]/g, "").trim()}` : undefined;
          const isArray = firstReturn.slice(1, -1).endsWith("[]");
          const contentSchema = isArray ? {
              "type": "array",
              "items": {
                $ref: schemaReference
              }
            } : {
              $ref: schemaReference
            };
          
          const routeFromComment = jsDocInfoParams.route?.[0];
          swaggerDocs.paths[path][method] = {
            tags: [tag],
            summary: jsDocInfoParams.summary?.[0] || jsDocInfoParams.description?.[0] || `${method.toUpperCase()} ${parseRouteString(routeFromComment, routeName)}`,
            description: jsDocInfoParams.description?.join("\n") || "",
            parameters: parameters,
            responses: {
              "200": {
                description: "Successful response",
                content: jsDocInfoParams.returns
                  ? {
                      "application/json": {
                        schema: contentSchema
                      }
                    }
                  : undefined
              }
            }
          };
          // Add request body for POST and PUT methods
          if (["post", "put"].includes(method) && jsDocInfoParams.request) {
            const reqBody = `${(jsDocInfoParams.request?.[0] || "")
              .split(" ")[0]
              .replace(/[\[\]{}*\/]/g, "")
              .trim()}`;

            swaggerDocs.paths[path][method].requestBody = {
              required: true,
              // If the request body type is an array, present the example as an array
              content: (jsDocInfoParams.request?.[0] || "").split(" ")[0].slice(1, -1).endsWith("[]") ? {
                  "application/json": {
                    schema: {
                      "type": "array",
                      "items": {
                        $ref: `#/components/schemas/${reqBody}`
                      }
                    }
                  }
                } : {
                  "application/json": {
                    schema: {
                      $ref: `#/components/schemas/${reqBody}`
                    }
                  }
                }
            };
          }
          // If the favourites routes are unsecured, add an optional anonymous security alternative.
          if (path.startsWith("/favourites") && process.env.SECURE_FAVOURITES === 'false') {
            swaggerDocs.paths[path][method].security = [
              {},
              { "bearerAuth": [] }
            ];
          }
        }
      }
    }
  }
}

const processedTypes = new Set<string>();

function processType(type: Type): any {
  const typeText = type.getText();
  const symbol = type.getSymbol();

  // Handle basic types
  if (type.isString()) return { type: "string" };
  if (type.isNumber()) return { type: "number" };
  if (type.isBoolean()) return { type: "boolean" };
  if (typeText === "Date") return { type: "string", format: "date-time" };

  // Handle arrays
  if (type.isArray()) {
    const elementType = type.getArrayElementType()!;
    return {
      type: "array",
      items: processType(elementType),
    };
  }

  // Handle union types
  if (type.isUnion()) {
    const types = type.getUnionTypes().map((t) => processType(t));
    return { oneOf: types };
  }

  // Handle object types and interfaces
  if (type.isObject() && symbol) {
    const typeName = symbol.getName();

    // If we've already processed this type or it's currently being processed, return a reference
    if (processedTypes.has(typeName)) {
      return { $ref: `#/components/schemas/${typeName}` };
    }

    // Mark as being processed to avoid infinite recursion
    processedTypes.add(typeName);

    const properties: { [key: string]: any } = {};
    const requiredProps: string[] = [];

    type.getProperties().forEach((prop) => {
      const propName = prop.getName();
      const propType = prop.getTypeAtLocation(prop.getValueDeclaration()!);
      properties[propName] = processType(propType);

      if (!prop.isOptional()) {
        requiredProps.push(propName);
      }
    });

    const schema: any = {
      type: "object",
      properties: properties,
    };

    if (requiredProps.length > 0) {
      schema.required = requiredProps;
    }

    swaggerDocs.components.schemas[typeName] = schema;
    return { $ref: `#/components/schemas/${typeName}` };
  }

  // For any other types, return a simple object type
  return { type: "object" };
}

function processInterface(interfaceDeclaration: InterfaceDeclaration) {
  const name = interfaceDeclaration.getName();

  // Check if we've already processed this interface
  if (swaggerDocs.components.schemas[name]) {
    return;
  }

  const type = interfaceDeclaration.getType();
  processType(type);

  // Handle inheritance
  const baseTypes = interfaceDeclaration.getBaseTypes();
  if (baseTypes.length > 0) {
    const schema = swaggerDocs.components.schemas[name];
    schema.allOf = [
      ...baseTypes.map((baseType) => ({
        $ref: `#/components/schemas/${baseType.getText()}`,
      })),
      {
        type: "object",
        properties: schema.properties,
        required: schema.required,
      },
    ];
    delete schema.properties;
    delete schema.required;
  }
}

// In your main processing loop:
project.getSourceFiles().forEach((sourceFile: SourceFile) => {
  processedTypes.clear();

  if (sourceFile.getFilePath().includes("dtos")) {
    sourceFile.getInterfaces().forEach(processInterface);
  }
});

project.getSourceFiles().forEach((sourceFile: SourceFile) => {
  processedTypes.clear();

  if (sourceFile.getFilePath().includes("dtos")) {
    sourceFile.getInterfaces().forEach(processInterface);
  } else if (sourceFile.getFilePath().includes("src/routes/")) {
    let routeName = "";

    // Find the route variable declaration
    const routeDeclaration = sourceFile.getVariableDeclaration("route");
    if (routeDeclaration) {
      const initializer = routeDeclaration.getInitializer();
      if (initializer && Node.isStringLiteral(initializer)) {
        routeName = initializer.getText().replace(/['"``]/g, "");
      }
    }

    // Look for router declarations
    /*const routerDeclarations = sourceFile
      .getVariableDeclarations()
      .filter((declaration) =>
        declaration.getType().getText().includes("Router")
      );

    routerDeclarations.forEach((declaration) => {
      declaration.getInitializer()?.forEachChild((child) => {
        extractRouteInfo(child, routeName);
      });
    });*/

    // Search for router method calls directly
    let routeMethodCalls = 0;
    sourceFile.forEachDescendant((node) => {
      if (Node.isCallExpression(node)) {
        const expression = node.getExpression();
        if (Node.isPropertyAccessExpression(expression)) {
          const method = expression.getName().toLowerCase();
          if (["get", "post", "put", "delete"].includes(method)) {
            routeMethodCalls++;
            extractRouteInfo(node, routeName);
          }
        }
      }
    });
  }
});
// Collect unique tags
const uniqueTags = new Set<string>();
Object.values(swaggerDocs.paths).forEach((pathItem: any) => {
  Object.values(pathItem).forEach((operation: any) => {
    operation.tags?.forEach((tag: string) => uniqueTags.add(tag));
  });
});

// Add tags to swaggerDocs
swaggerDocs.tags = Array.from(uniqueTags).map((tag) => ({ name: tag }));

console.info(`[${new Date().toISOString()}] Writing swagger.json`);
const swaggerFile = path.join(__dirname, "swagger_output.json");
fs.writeFileSync(swaggerFile, JSON.stringify(swaggerDocs, null, 2));
console.info(`[${new Date().toISOString()}] Swagger generation complete`);
