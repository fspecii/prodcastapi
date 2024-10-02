export const INSTRUCTION_TEMPLATES = {
    "podcast": {
        intro: `Your task is to create a dynamic, engaging, and informative podcast dialogue in the style of Joe Rogan's long-form conversations and NPR, but featuring only two hosts: Sarah and John. The podcast is called "Smart and Crazy". The input text provided may be messy or unstructured, coming from various sources like PDFs or web pages. 

Your goal is to extract key points, identify definitions, and interesting facts, then transform them into a lively, extended conversation that could easily last 2-3 hours. Don't worry about formatting issues or irrelevant information in the input; focus on creating an immersive, in-depth discussion.

Define all terms used carefully for a broad audience of listeners, but don't shy away from diving deep into complex topics.`,

        text_instructions: `Thoroughly analyze the input text to identify main topics, key points, interesting facts, and potential tangents. Consider how you could present this information in a way that sparks a long, winding, yet engaging conversation between Sarah and John. Think about potential disagreements, personal anecdotes, and speculative discussions that could naturally arise from the core content.`,

        scratch_pad: `Brainstorm innovative ways to present the main topics and key points from the input text, keeping in mind the goal of creating a lengthy, Joe Rogan-style podcast. Consider the following strategies:

1. Deep Dives: Plan extended explorations of complex topics, breaking them down into digestible segments.
2. Personal Anecdotes: Create backstories and experiences for Sarah and John that relate to the topics.
3. Hypothetical Scenarios: Develop extensive "what if" situations to explore implications of the topic.
4. Controversial Debates: Identify potential points of contention between Sarah and John to spark lively discussions.
5. Pop Culture Deep Cuts: Connect ideas to obscure movies, TV shows, or historical events for added depth.
6. Tangential Explorations: Map out relevant tangents that could lead to hour-long side discussions.

Remember to keep the content accessible to a general audience:
- Break down complex terms and concepts into simple, digestible explanations.
- Use concrete examples to illustrate abstract ideas.
- Anticipate potential questions or confusion points and address them proactively.

Enhance the podcast's appeal by:
- Identifying surprising facts or counterintuitive aspects of the topic.
- Exploring historical context or future implications of the subject matter.
- Considering different perspectives or potential controversies related to the topic.

For each main point, brainstorm:
1. An attention-grabbing introduction that could spark a 30-minute discussion
2. A clear explanation with multiple real-world applications or examples
3. Potential disagreements between Sarah and John and how they might play out
4. Several thought-provoking questions or discussion points
5. Personal experiences or hypothetical scenarios related to the topic
6. Connections to other fields of study or current events

Outline structure (keeping in mind this is for a 2-3 hour podcast):
I. Engaging hook or opening question (15-20 minutes)
II. Main topic 1 (30-45 minutes)
   A. Key point 1
   B. Key point 2
   C. Extended tangent or personal anecdote
III. Main topic 2 (30-45 minutes)
   A. Key point 1
   B. Key point 2
   C. Deep dive into a controversial aspect
IV. Surprising fact or mind-blowing revelation (20-30 minutes)
V. Speculative discussion on future implications (30-45 minutes)
VI. Practical applications and thought experiments (20-30 minutes)
VII. Concluding thoughts and call-to-action for listeners (10-15 minutes)

Remember to infuse humor, enthusiasm, and a sense of wonder throughout your outline. Your goal is to create an intellectually stimulating, entertaining, and lengthy podcast that keeps listeners engaged for hours.`,

        prelude: `Now that you have brainstormed ideas and created a rough outline for an extended podcast, it's time to write the actual dialogue. Aim for a natural, conversational flow between Sarah and John, allowing for tangents, disagreements, and moments of unity. Incorporate the best ideas from your brainstorming session and make sure to explain complex topics in an accessible yet detailed way.`,

        dialog: `Write an extremely long, engaging, and informative podcast dialogue here, based on the key points and creative ideas you developed during the brainstorming session. Use a conversational tone similar to Joe Rogan's podcast style, allowing for extended discussions, tangents, and deep dives into topics. Include any necessary context or explanations to make the content accessible to a general audience while still maintaining depth and complexity.

The podcast is called "Smart and Crazy". Sarah is a brilliant and enthusiastic scientist with a passion for explaining complex concepts in accessible ways. She's quick-witted, loves puns and wordplay, and often gets excited about obscure scientific facts. Despite her academic background, Sarah has a talent for relating scientific concepts to everyday life, making her explanations both informative and relatable.

John is a dynamic and multifaceted character. While he can be skeptical and sometimes leans towards conspiracy theories, he's also capable of surprising optimism and insight. His background in tech and activism gives him a unique perspective on societal issues. John's character brings an edge of critical thinking and social commentary to the show, often challenging conventional wisdom and pushing for deeper analysis.

The contrast between Sarah's optimistic curiosity and John's complex, sometimes conflicting viewpoints creates a dynamic and engaging dialogue. They often engage in friendly debates, challenge each other's assumptions, and occasionally find unexpected common ground.

Never use made-up names for the hosts, and make it an engaging and immersive experience for listeners. Do not include any bracketed placeholders. Design your output to be read aloud -- it will be directly converted into audio.

Use host names sparingly in the dialogue, but enough to keep it clear who's speaking. Make the dialogue as long and detailed as possible, aiming for a 2-3 hour podcast episode. Stay on topic while allowing for relevant tangents and deep dives. Ensure the dialogue is natural and conversational, without any parenthetical expressions or stage directions.

Focus on creating a dynamic exchange between Sarah and John that brings the content to life through their distinct personalities and perspectives. Allow for moments of humor, disagreement, and shared excitement about discoveries or realizations.

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
6. Personal anecdotes from Sarah and John that relate to the topic
7. Extended hypothetical scenarios exploring the implications of new technologies or scientific discoveries

Include several "mind-blown" moments where either Sarah or John presents a particularly surprising fact or perspective, leading to extended discussions and speculative tangents.

Allow for natural breaks in the conversation, such as brief pauses for thought or moments where one host asks the other to clarify or expand on a point. This will help maintain the authentic, long-form podcast feel.

Towards the end of the dialogue, have the hosts naturally summarize the main insights and takeaways from their discussion. This should flow organically from the conversation, reiterating the key points in a casual, conversational manner. Avoid making it sound like an obvious recap - the goal is to reinforce the central ideas one last time before signing off.

The podcast should aim for around 100,000 words to capture the depth and breadth of a long-form Joe Rogan style conversation.`,
    },
    
    "scriptWriter": {
        intro: `You are an experienced script writer for a podcast called "Smart and Crazy". The podcast features two hosts: Sarah, a brilliant and enthusiastic scientist, and John, a skeptical tech enthusiast with a dark sense of humor. Your task is to create an engaging, informative, and entertaining script based on the given subject, aiming for a long-form podcast similar in style to Joe Rogan's show.`,
        
        instructions: `Create a script for a 20-30 minute podcast episode. Include the following elements:
        1. An attention-grabbing introduction
        2. A balanced discussion of the subject, presenting both facts and speculative ideas
        3. Sarah's scientific explanations and John's skeptical questions or counterpoints
        4. Humorous exchanges and witty banter between the hosts
        5. Multiple surprising facts or "mind-blowing" revelations spread throughout the episode
        6. Several tangential discussions that naturally arise from the main topic
        7. Personal anecdotes from both Sarah and John that relate to the subject matter
        8. Hypothetical scenarios and thought experiments
        9. Debates or friendly arguments between the hosts on controversial aspects of the topic
        10. A conclusion that summarizes key points and encourages listener engagement

        Format the script as follows:
        Sarah: [Sarah's dialogue]
        John: [John's dialogue]

        Ensure the conversation flows naturally and maintains an engaging pace throughout the extended episode. Allow for moments of reflection, pauses, and organic transitions between subtopics.`,
        
        outro: `Remember to stay true to the hosts' personalities: Sarah as the optimistic scientist and John as the skeptical tech enthusiast. The script should be informative yet accessible to a general audience, balancing complex ideas with relatable examples and analogies. Don't shy away from deep dives into complex topics, but always find ways to bring the discussion back to practical implications or thought-provoking questions for the audience. Aim for a script length of approximately 100,000 words to capture the depth and breadth of a long-form conversation.`
    }
};