# FAE: Accelerated Development 

FAE is a VSCode extension with a companion Chrome extension that tracks your browsing history and links it to your codebase, so the next time you need to look up past urls and relevant documentations, you can do it directly from the specific part of your code in the IDE. It also comes with a handy dashboard that tracks your time spent in the editor live, and has an auto generated Wiki of your codebase with an interactive file dependency network visualization. Additionally, annotated links come with an in-IDE hover URL preview feature. 

 

## What inspired you 

Despite the abundance of tab managers, developers face challenges remembering context of an opened URL or being able to find specific tabs once we have too many open. On the other hand, onboarding processes for existing codebases take months because of lack of detailed documentation and lack of insight into the development process. 

By syncing our IDE development process with our browsing activity, we aim to overcome the challenges of forgotten context and add insight about the development process to new developers. With the added auto-generated project wiki, the onboarding process is simplified without extra work on part of the original developer such as specific code formatting that most existing documentation generators use. 

 

## What you learned 

Making this project was a fun and valuable experience for all of us. All of us have different experience levels and technical specialties so we benefited from each other and had a unique learning experience. Here are our highlights: 

- VSCode & Chrome Extension Development: Cross platform extension sync (Bonus – our first time with extension development for VSCode or Chrome!) 

- Code Hashing & Scope chunking: Hashing chunks of code with unique identifiers and developing chunking algorithm tied with scoping 

- Dependency network generation and WebView display integration: Generation of raw adjacency list data and visualizing a network on the frontend from that 

 

## How you built your project 

FAE is built primarily on TypeScript for the VSCode extension and JavaScript for the Chrome extension. We use WebPack for bundling that ensures smaller, uniform code and faster deployment. We use a Firebase backend for ...... 

 

## Challenges you faced 

As first-time extension builders, we ran into several challenges throughout different parts of our development journey. 

- Limited VSCode API documentation 

- Determining code chunking 