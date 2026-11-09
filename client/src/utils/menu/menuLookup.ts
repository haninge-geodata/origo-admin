import menuItems from "@/assets/config/menuitems.json";

export interface MenuItem {
  id: number;
  name: string;
  urlSegment: string;
  type: string;
  icon: string;
  schemaPath: string;
  disabled: boolean;
  requiresAuth?: boolean;
}

export interface MenuGroup {
  id: number;
  name: string;
  type: string;
  children?: MenuItem[];
  requiresAuth?: boolean;
}

export function findMenuItemByType(schemaType: string): MenuItem {
  const expectedUrlSegment = `/layers/${schemaType}`;

  for (const group of menuItems as MenuGroup[]) {
    if (group.children) {
      for (const item of group.children) {
        if (item.urlSegment === expectedUrlSegment) {
          return item;
        }
      }
    }
  }
  throw new Error(
    `No menu item found for schema type "${schemaType}". ` +
      `Expected URL segment: ${expectedUrlSegment}. ` +
      `Please check that a menu item exists with this urlSegment and has a schemaPath configured.`
  );
}

export function validateSchemaTypeConfig(schemaType: string): boolean {
  try {
    const menuItem = findMenuItemByType(schemaType);
    return menuItem.schemaPath.length > 0;
  } catch {
    return false;
  }
}

export function getAvailableSchemaTypes(): string[] {
  const schemaTypes: string[] = [];

  for (const group of menuItems as MenuGroup[]) {
    if (group.children) {
      for (const item of group.children) {
        // Check if this is a layers URL with a schemaPath
        if (item.urlSegment?.startsWith("/layers/") && item.schemaPath) {
          const schemaType = item.urlSegment.replace("/layers/", "");
          schemaTypes.push(schemaType);
        }
      }
    }
  }

  return schemaTypes;
}
