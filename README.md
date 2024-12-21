# Media Assistant for People with Severe Age-Related Macular Degeneration (AMD)

This project was the idea of [Dr. Ravi Thyagarajan](https://engineering.tamu.edu/mechanical/profiles/thyagarajan-ravi.html), a professor at Texas A&M, who's father suffers from severe AMD. As a result, he cannot read, let alone see any user interface more complex than a few colored rectangles. 

AMD Media Assistant reads articles scraped from the internet while providing a simple UI such that people with impared vision can control it. In addition, it exposes an external dashboard so a caretaker can configure websites targeted and other various settings

## What is Age-Related Macular Degeneration, or AMD?

![img](https://www.drugs.com/cg/images/en3529084.jpg)

Dry macular degeneration is an eye condition that causes blurred vision or reduced central vision. It is caused by the breakdown of a part of the retina known as the macula, which is responsible for central vision. This condition is common among people over 50.

## Package Architecture

| Identifier | Description |
| --- | --- |
| amdassistant-backend | Serves clients and performs content scraping |
| amdassistant-clientmobile | Mobile UI for visually impared streaming |
| amdassistant-clientweb | Web UI for caretaker content management |
| amdassistant-common | Shared libraries |


## What are the technical details?

* Microsoft Azure products in the backend.
* OpenAI as LLM provider.
* React Native for mobile client.
* React for web client.
* Almost entirely TypeScript.
