import { summarizeFile } from "../wiki/code_describer.js";

summarizeFile('sample_code/Q.py').then((res) => {
  console.log(res);
  process.exit(0);
});
