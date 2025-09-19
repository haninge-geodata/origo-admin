import React, { useEffect, useRef, useCallback, useState } from 'react';
import { JSONEditor, JSONEditorPropsOptional } from 'vanilla-jsoneditor';
import { parse, stringify } from 'lossless-json';
import dynamic from 'next/dynamic';
import type { Content, TextContent, OnChangeStatus } from 'vanilla-jsoneditor';

// Intern komponent, inte avsedd för export
const JSONEditorInternalComponent: React.FC<JSONEditorPropsOptional> = (props) => {
    const refContainer = useRef<HTMLDivElement>(null);
    const refEditor = useRef<JSONEditor | null>(null);
    const LosslessJSONParser = { parse, stringify };
    enum Mode {
        text = "text",
        tree = "tree",
        table = "table"
    }
    useEffect(() => {
        refEditor.current = new JSONEditor({
            target: refContainer.current!,
            props: {
                navigationBar: false,
                mainMenuBar: false,
                mode: Mode.text,
            }
        });
        return () => {
            if (refEditor.current) {
                refEditor.current.destroy();
                refEditor.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (refEditor.current) {
            refEditor.current.updateProps(props);
        }
    }, [props]);

    return (
        <div
            ref={refContainer}
            style={{
                height: 'clamp(200px, 30vh, 400px)',
                minHeight: '200px',
                maxHeight: '400px',
                overflow: 'auto',
                resize: 'vertical'
            }}
        />
    );
};

const JSONEditorInternal = dynamic(() => Promise.resolve(JSONEditorInternalComponent), { ssr: false });
interface JSONEditorReactProps {
    value: object;
    onChange: (newValue: object) => void;
    onBlur?: () => void;
}

const JSONEditorReact = ({ value, onChange, onBlur }: JSONEditorReactProps) => {
    const hasMounted = useRef(false);
    const [jsonContent, setJsonContent] = useState<Content>({ json: value })
    const handler = useCallback(
        (content: Content, previousContent: Content, status: OnChangeStatus) => {
            setJsonContent(content)
        }, []);

    useEffect(() => {
        if (hasMounted.current) {
            try {
                var textContent = jsonContent as TextContent;
                var parsedJSON = JSON.parse(textContent.text);
                onChange(parsedJSON);
            }
            catch (e) {
            }
        }
        else {
            hasMounted.current = true;
        }
    }, [jsonContent]);
    return (
        <>
            <JSONEditorInternal content={jsonContent} onChange={handler} onBlur={onBlur} />
        </>
    );
}

export default JSONEditorReact;