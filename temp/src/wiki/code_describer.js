import OpenAI from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export async function summarizeFile(file_path, dependency_graph, openai_api_key) {
  console.log('summarizeFile', file_path, openai_api_key);
  const openai = new OpenAI({
    apiKey: openai_api_key || process.env.OPENAI_API_KEY,
  });
  const file_text = fs.readFileSync(file_path, 'utf8');
  const prompt = `Project Dependencies:\n${JSON.stringify(dependency_graph, null, 2)}\n\`\`\`${file_path}\n${file_text}\n\`\`\`\nI need to understand how each file relates to each other in my code. Write a 2-3 sentence description of the purpose of this file in the context of this dependency graph. KEEP IT SHORT AND MINIMAL. Don't include superfluous explanations. For example, "This file contains a function to instantiate a database client and logger. It is used by the App class to start the server."`;
  console.log(prompt);
  const summary = await openai.chat.completions.create({
    messages: [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": prompt},
    ],
    model: "gpt-3.5-turbo",
  });
  return summary.choices[0].message.content;
}



export async function summarizeProject(wiki_json, openai_api_key) {
  const openai = new OpenAI({
    apiKey: openai_api_key || process.env.OPENAI_API_KEY,
  });
  const wiki_text = JSON.stringify(wiki_json, null, 2);
  const prompt = `${wiki_text}\nI need to explain to a newcomer the overall purpose and structure of this software project, including what the files do. Write a brief description of the structure of this project, using the context provided above. Keep it concise. Don't include superfluous explanations.`;
  console.log(prompt);
  const summary = await openai.chat.completions.create({
    messages: [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": prompt},
    ],
    model: "gpt-4",
  });
  return summary.choices[0].message.content;

}




