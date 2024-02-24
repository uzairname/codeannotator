import OpenAI from "openai";
const openai = new OpenAI();

async function main() {
  const myAssistantFile = await openai.beta.assistants.files.create(
    "asst_hWD7AOmpqJ1HmVtBCZh7gtVu",
    {
      file_id: "file-mTytwWmuqzohxbxmQrgf4FDa"
    }
  );
  console.log(myAssistantFile);
}

main();
