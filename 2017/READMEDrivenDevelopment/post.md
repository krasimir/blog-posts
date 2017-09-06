# README driven development

I was doing a [podcast episode](https://www.youtube.com/watch?v=FEeL_c2wtpU&t=1608s) with [Kent C. Dodds](https://kentcdodds.com/) when he mentioned README-driven development. And so I decided to try it out with a new [library](https://github.com/krasimir/stent) which I just started. Here's what I found.

README-driven development is exactly what you think. We first write the README/docs and then the actual code. It is also called documentation-driven development. For me it worked pretty well because I wasn't really sure about the API of the library. I just started throwing ideas and step by step I fulfilled all the stuff which I wanted to make. Here are a couple of points which I can make if that approach is applied to developing a library:

* I was able to see what is the developer experience. Seeing the library only from the outside helped me focusing more on the API. The fact that I had zero lines of code freed my brain of implementation details and I design the API in the best possible way.
* It's a nice sketch for the tests. I followed TDD afterwards and having the README done helped me writing the specs for no time.
* Without battle-testing the library I don't know about methods which are actually needed. README-driven development made me think more from the consumer's side of the things. I had some ideas which I crossed out just because they didn't make sense when I started writing the examples.
* And of course it's really easy to delete or modify everything. I changed the API drastically couple of times and that was completely fine. If I've had some code written such changes will probably make me start from scratch.
* I didn't have to go back and deal with the boring part - the documentation. That's because I already have it. In general, following this approach made the documenting much easier and fun.