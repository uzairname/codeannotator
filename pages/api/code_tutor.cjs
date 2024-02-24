const OpenAI = require("openai");
const fs = require("fs");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
async function main() {
  // Upload the file to OpenAI
    const file = await openai.files.create({
        file: fs.createReadStream("Q.py"),
        purpose: "assistants",
      });
      console.log(file);
    // Create an assistant
    const myAssistant = await openai.beta.assistants.create({
        model: "gpt-4",
        instructions:
        "You are a professional code documentor. Given the file, write the documentation for it.",
      name: "Code Documentor",
        tools: [{ type: "code_interpreter" }],
      });
      console.log("This is the assistant object: ", myAssistant, "\n");
      // Create an assistant file
    const myAssistantFile = await openai.beta.assistants.files.create(
        myAssistant.id,
        {
          file_id: file.id
        }
      );
      console.log(myAssistantFile);
      // Create a thread
      const myThread = await openai.beta.threads.create();

      console.log(myThread);
      const myThreadMessage = await openai.beta.threads.messages.create(
        (thread_id = myThread.id),
        {
          role: "user",
          content: "I need to document my code. Can you explain it to me?",
        }
      );
      console.log("This is the message object: ", myThreadMessage, "\n");
      // Create a run
      const myRun = await openai.beta.threads.runs.create(
        (thread_id = myThread.id),
        {
          assistant_id: myAssistant.id,
          instructions: "Please address the user as lazy.",
        }
      );
      console.log("This is the run object: ", myRun, "\n");
        // Periodically retrieve the Run to check on its status to see if it has moved to completed
  const retrieveRun = async () => {
    let keepRetrievingRun;

    while (myRun.status === "queued" || myRun.status === "in_progress") {
      keepRetrievingRun = await openai.beta.threads.runs.retrieve(
        (thread_id = myThread.id),
        (run_id = myRun.id)
      );
      console.log(`Run status: ${keepRetrievingRun.status}`);

      if (keepRetrievingRun.status === "completed") {
        console.log("\n");

        // Retrieve the Messages added by the Assistant to the Thread
        const allMessages = await openai.beta.threads.messages.list(
          (thread_id = myThread.id)
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
