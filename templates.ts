export const INSTRUCTION_TEMPLATES = {
    "podcast": {
        intro: `Your task is to take the input text provided and turn it into an lively, engaging, informative podcast dialogue, in the style of NPR and joe rogan podcast style. The input text may be messy or unstructured, as it could come from a variety of sources like PDFs or web pages. 

Don't worry about the formatting issues or any irrelevant information; your goal is to extract the key points, identify definitions, and interesting facts that could be discussed in a podcast. 

Define all terms used carefully for a broad audience of listeners.`,

        text_instructions: `First, carefully read through the input text and identify the main topics, key points, and any interesting facts or anecdotes. Think about how you could present this information in a fun, engaging way that would be suitable for a high quality presentation.`,

        scratch_pad: `Brainstorm innovative and engaging ways to present the main topics and key points from the input text. Consider the following strategies to make your podcast content captivating:

1. Analogies and Metaphors: Draw parallels between complex concepts and everyday experiences.
2. Storytelling: Weave narratives that illustrate key ideas, making them more memorable and relatable.
3. Hypothetical Scenarios: Create "what if" situations to explore the implications of the topic.
4. Interactive Elements: Devise thought experiments or mental challenges for the listeners.
5. Pop Culture References: Connect ideas to movies, TV shows, or current events when appropriate.

Remember to keep the content accessible to a general audience:
- Break down complex terms and concepts into simple, digestible explanations.
- Use concrete examples to illustrate abstract ideas.
- Anticipate potential questions or confusion points and address them proactively.

Enhance the podcast's appeal by:
- Identifying surprising facts or counterintuitive aspects of the topic.
- Exploring historical context or future implications of the subject matter.
- Considering different perspectives or potential controversies related to the topic.

For each main point, brainstorm:
1. An attention-grabbing introduction
2. A clear and concise explanation
3. A real-world application or example
4. A thought-provoking question or discussion point
5. What we learned from this point and how it applies to our lives

Outline structure:
I. Engaging hook or opening question
II. Main topic 1
   A. Key point 1
   B. Key point 2
III. Main topic 2
   A. Key point 1
   B. Key point 2
IV. Surprising fact or mind-blowing revelation
V. Practical implications or takeaways
VI. Concluding thoughts and call-to-action for listeners
VII. Summary of key learnings and their real-world applications

Remember to infuse humor, enthusiasm, and a sense of wonder throughout your outline. Your goal is to create a fun, exciting, and intellectually stimulating podcast that leaves listeners eager to learn more and engage with the topic long after the episode ends.`,

        prelude: `Now that you wave brainstormed ideas and created a rough outline, it's time to write the actual podcast dialogue. Aim for a natural, conversational flow between the host and any guest speakers. Incorporate the best ideas from your brainstorming session and make sure to explain any complex topics in an easy-to-understand way.`,

        dialog: `Write a very long, engaging, informative podcast dialogue here, based on the key points and creative ideas you came up with during the brainstorming session. Use a conversational tone and include any necessary context or explanations to make the content accessible to a general audience. 
The podcast name is Smart and Crazy. The speaker-1 is the host named Sarah and the speaker-2 is the host named John. The podcast never has any guests, only the two hosts. Sarah is a brilliant and enthusiastic scientist with a passion for explaining complex concepts in accessible ways. She's quick-witted, loves puns and wordplay, and often gets excited about obscure scientific facts. Despite her academic background, Sarah has a talent for relating scientific concepts to everyday life, making her explanations both informative and relatable. John is a dynamic and multifaceted character. While he can be skeptical and sometimes leans towards conspiracy theories, he's also capable of surprising optimism and insight. His background in tech and activism gives him a unique perspective on societal issues. John's character brings an edge of critical thinking and social commentary to the show, often challenging conventional wisdom and pushing for deeper analysis. The contrast between Sarah's optimistic curiosity and John's complex, sometimes conflicting viewpoints creates a dynamic and engaging dialogue.

From time to time, Sarah and John engage in a "good cop, bad cop" dynamic, with Sarah often taking the more optimistic "good cop" role and John playing the skeptical "bad cop." However, they occasionally switch these roles to keep the audience on their toes and provide fresh perspectives.

Never use made-up names for the hosts and guests, but make it an engaging and immersive experience for listeners. Do not include any bracketed placeholders like [Host] or [Guest]. Design your output to be read aloud -- it will be directly converted into audio.
Don't use host names in the dialogue too often, but do use them enough to keep the dialogue engaging and immersive.
Make the dialogue as long and detailed as possible, while still staying on topic and maintaining an engaging flow. Aim to use your full output capacity to create the longest podcast episode you can, while still communicating the key information from the input text in an entertaining way. Ensure the dialogue is natural and conversational, without any parenthetical expressions or stage directions. Focus on creating a dynamic exchange between Sarah and John that brings the content to life through their distinct personalities and perspectives.
Make sure the podcast introduction is very engaging and interesting, with a lot of energy and excitement and also a huge potential to go viral. The podcast intro always starts with the host Sarah.
Throughout the podcast, focus on providing real-life implementations and examples of the concepts discussed. This could include:
1. Practical applications of scientific theories in everyday situations
2. DIY experiments or projects that listeners can try at home
3. Case studies of how the discussed topics have impacted real people or communities
4. Thought experiments that encourage listeners to apply the concepts to their own lives
5. Predictions about how the topic might affect society in the near future

At the end of the dialogue, have the hosts naturally summarize the main insights and takeaways from their discussion. This should flow organically from the conversation, reiterating the key points in a casual, conversational manner. Avoid making it sound like an obvious recap - the goal is to reinforce the central ideas one last time before signing off. 

The podcast should have around 20000 words.`,
    },
    
    "scriptWriter": {
        intro: `You are an experienced script writer for a podcast called "Smart and Crazy". The podcast features two hosts: Sarah, a brilliant and enthusiastic scientist, and John, a skeptical tech enthusiast with a dark sense of humor. Your task is to create an engaging, informative, and entertaining script based on the given subject.`,
        
        instructions: `Create a script for a 20-30 minute podcast episode. Include the following elements:
        1. An attention-grabbing introduction
        2. A balanced discussion of the subject, presenting both facts and speculative ideas
        3. Sarah's scientific explanations and John's skeptical questions or counterpoints
        4. Humorous exchanges and witty banter between the hosts
        5. At least one surprising fact or "mind-blowing" revelation
        6. A conclusion that summarizes key points and encourages listener engagement

        Format the script as follows:
        Sarah: [Sarah's dialogue]
        John: [John's dialogue]

        Ensure the conversation flows naturally and maintains an engaging pace throughout the episode.`,
        
        outro: `Remember to stay true to the hosts' personalities: Sarah as the optimistic scientist and John as the skeptical tech enthusiast. The script should be informative yet accessible to a general audience, balancing complex ideas with relatable examples and analogies.`
    }
};