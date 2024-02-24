import OpenAI from "openai";

const openai = new OpenAI();

async function main() {
  const run = await openai.beta.threads.runs.create(
    "thread_1WWz2Jjpa9A6otuocT0b04Ga",
    { assistant_id: "asst_hWD7AOmpqJ1HmVtBCZh7gtVu" }
  );

  console.log(run);
}

main();
