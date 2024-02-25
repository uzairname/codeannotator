import OpenAI from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export async function summarizeFile(path, openai_api_key) {
  console.log('summarizeFile', path, openai_api_key);
  const openai = new OpenAI({
    apiKey: openai_api_key || process.env.OPENAI_API_KEY,
  });
  const file_text = fs.readFileSync(path, 'utf8');
  const prompt = `\`\`\`\n${file_text}\n\`\`\`\nI need to document my code. Write a concise description of the purpose of this file.`;
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





async function main(path) {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Upload the file to OpenAI

    const Assistant_ID = "asst_86lLEPIAipeTG1ywPrtfXt0O";

    // remove all files
    const files = await openai.beta.assistants.files.list(Assistant_ID);
    for (const file of files.data) {
      await openai.beta.assistants.files.del(Assistant_ID, file.id);
      await openai.files.del(file.id);
    }

    // Create an assistant
    // const myAssistant = await openai.beta.assistants.create({
    //     model: "gpt-4",
    //     instructions:
    //     "You are a professional code documentor. Given the file, write the documentation for it. The end of the file should tell you the language.",
    //   name: "Code Documentor",
    //     tools: [{ type: "code_interpreter" }],
    //   });
    //   console.log("This is the assistant object: ", myAssistant, "\n");
    // Create an assistant file

    const file = await openai.files.create({
      file: fs.createReadStream("sample_code/anotherQ.cpp"),
      purpose: "assistants",
    });

    console.log(file);

    const myAssistantFile = await openai.beta.assistants.files.create(
      Assistant_ID,
      {
        file_id: file.id
      }
    );

    console.log("myAssistantFile: ", myAssistantFile);
    // Create a thread
    const myThread = await openai.beta.threads.create();

    console.log(myThread);
    const myThreadMessage = await openai.beta.threads.messages.create(
      (myThread.id),
      {
        role: "user",
        content: "I need to document my code. Can you explain it to me?",
        file_ids: [file.id],
      }
    );
    console.log("This is the message object: ", myThreadMessage, "\n");
    // Create a run
    const myRun = await openai.beta.threads.runs.create(
      myThread.id,
      {
        assistant_id: Assistant_ID,
        instructions: "Please address the user as lazy. Do not ask any questions.",
      }
    );
    console.log("This is the run object: ", myRun, "\n");
  // Periodically retrieve the Run to check on its status to see if it has moved to completed

  const retrieveRun = async () => {
    let keepRetrievingRun;

    while (myRun.status === "queued" || myRun.status === "in_progress") {
      keepRetrievingRun = await openai.beta.threads.runs.retrieve(
        myThread.id,
        myRun.id
      );
      console.log(`Run status: ${keepRetrievingRun.status}`);

      if (keepRetrievingRun.status === "completed") {
        console.log("\n");

        // Retrieve the Messages added by the Assistant to the Thread
        const allMessages = await openai.beta.threads.messages.list(
          myThread.id
        );

        console.log(
          "------------------------------------------------------------ \n"
        );

        console.log("User: ", myThreadMessage.content[0].text.value);
        console.log("Assistant: ", allMessages.data[0].content[0].text.value);

        break;
      } else if (
        keepRetrievingRun.status === "queued" ||
        keepRetrievingRun.status === "in_progress"
      ) {
        // pass
      } else {
        console.log(`Run status: ${keepRetrievingRun.status}`);
        break;
      }
    }
  };
  retrieveRun();
}

// main();
