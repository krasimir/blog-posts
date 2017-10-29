# Replacing Redux with Stent (a state machine factory)

This article is about [Stent](https://github.com/krasimir/stent) - a Redux-liked library that creates and manages state machines for you.

![Stent](./imgs/logo.gif)

In medicine, a stent is a metal or plastic tube inserted into the lumen of an anatomic vessel or duct to keep the passageway open [*](https://en.wikipedia.org/wiki/Stent). Or in other words it is a tool that restores blood flow through narrow or blocked arteries. I've made the parallel with an application that I worked on. The application state there had many dependencies so I was basically stuck into a logical loop and that little library helped me solve the problem. It kinda freed my mind and made me define clear state and simple transitions.