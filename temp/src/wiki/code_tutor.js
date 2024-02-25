import OpenAI from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  /**
   * [
    'file-FzBD8uH9Tbf27juxpxi1rcL4',
    'file-b2ZrCMjgpuKaPCQh2VVRsCY6',
    'file-zOJtG5zjndSKyiw2Xc5A6qQP',
    'file-t49vXI5JxQtOfKnh5vZKNvtF',
    'file-XMAKWZsswg84m79CFisK9yQ8',
    'file-urXCuvDG3QkjXG3MKboznyv1',
    'file-XwEoBnwjdGslAefpDRPuSkNd',
    'file-jKfcBeMihnZcOsvK851w1YQ3'
  ],
  */

async function main() {
    // Upload the file to OpenAI

    const Assistant_ID = "asst_86lLEPIAipeTG1ywPrtfXt0O";

    // remove all files
    const files = await openai.beta.assistants.files.list(Assistant_ID);
    for (const file of files.data) {
      await openai.beta.assistants.files.del(Assistant_ID, file.id);
      await openai.files.del(file.id)
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

main();