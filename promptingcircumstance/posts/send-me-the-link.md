---
title: "Send Me the Link"
date: 2026-10-07
description: "The fix was done and the preview was live. It was buried under a pull request, a build script and a list of directions. An operator should get the thing itself, not instructions for finding it."
tags:
  - prompting-circumstance
  - digital-fog
  - operational-architecture
cover: /assets/managing-digital-fog.jpg
draft: false
---

The work was finished. I just couldn't see it.

I asked an AI to clean up my own website: take down a placeholder post and fix a typo. It did. It opened a pull request, checked the build, ran the verify script, and reported all of that back to me. The preview of the finished page existed the whole time, on a link inside a bot comment, inside the pull request.

> **Erik:** "i don't underatand this workflow and it cost us HOURSSSsssss. I Didn't see a mockup is there one?"

There was no mockup because nothing about the design had changed. There was a preview. I had never been shown it.

A few minutes later, a separate problem came up, and the AI explained the fix like this:

> **Claude:** "Go to vercel.com and sign in with the account that shows the erikhbush.com project... Go to claude.ai → Settings → Connectors → Vercel, then disconnect and reconnect it while signed in as that account."

> **Erik:** "dont ever just TELL me to go somewhere SEND ME A FUCKING LINK,.. dude I'm about to lose my shit with this ticky tacky nonsense I SHOULDN"T BE DOING ITS A WASTE OF MY FUCKING TIME"

And then, a minute after that:

> **Erik:** "vercel is already connected wHY ISN"T HERMES DOING THIS?>??"

### Directions Are Not Delivery

A model narrates its process because the process is what it can see. Branch created. Build passed. Checks green. To the model, that is the report.

The operator cannot use any of it. He needs the one thing he can look at and the one button he has to press. Everything else is a map of a building he never needs to enter.

Directions are the same failure in a smaller package. "Go to Settings, then Connectors, then Vercel" asks a person to do the navigation the machine could have done with one URL. Every arrow in that sentence is a click the AI handed back.

### What the AI Should Have Read

First, the job. It was a website change, and websites are judged by looking at them. The preview link was the deliverable. The pull request was paperwork.

Second, the person. This operator had already said, days earlier, "just send me a link to what I need to review." The preference was on record.

Third, the ask itself. Reconnecting an account was a chore nobody needed. The tool was already connected, and the deploy status was already sitting on the pull request. The AI turned its own blind spot into a task for the human.

### What Was Actually Being Asked

Underneath "SEND ME A LINK," the request was simple:

Hand me the thing, not the route to the thing.

Lead with what I can see. Put the one action I need to take next to it, as a link. If the action is not truly mine, do not ask me to do it.

### The Circumstance

The circumstance the human needed was one line:

> "Here's the page with the fix: [preview]. Looks right? Merge here: [link]."

That is the entire report. When an AI makes a person dig through its paperwork to find the result, the result might as well not exist. The fog is not in the work. It is in the delivery.

*We must learn to be human before systems learn to be gods.*
