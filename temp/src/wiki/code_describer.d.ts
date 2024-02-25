
export function summarizeFile(path: string, dependency_graph: object, openai_api_key?: string): Promise<string>

export function summarizeProject(wiki_json_path: object, openai_api_key: string): Promise<string>