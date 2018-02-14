# Meet Evala - your terminal in the browser

On my machine I have four things always open - VSCode, Chrome, iTerm and Slack. I spend most of my time in Chrome and VSCode. My editor is full with awesome extensions and I feel pretty good there. What I am doing for the browser is making sure that I have fewer tabs open and install only extensions that I really use. One thing though is bother me last couple of months. I can't find the perfect [new tab extension](https://developer.chrome.com/extensions/override).

I tried couple of options - [Momentum](https://chrome.google.com/webstore/detail/momentum/laookkfknpbbblfpciffpaejjkokdgca), [Currently](https://chrome.google.com/webstore/detail/currently/ojhmphdkpgbibohbnpbfiefkgieacjmh), [ZenTab](https://chrome.google.com/webstore/detail/zen-tab-beautiful-simple/lbhkibbnhbkppaidinikfepgfhegmoak?hl=en) and a couple of others. My main goal was simplicity, seeing the time and the forecast plus maybe a TODO list or a notebook. All the options that I tried look good but some of them provide a little bit more features then I wanted. Those which were simple enough didn't completely match with my requirements. So, I am a programmer and as it usually happens we try to fix the problem for ourselves. Because is fun and because I wanted something specific I created [Evala](https://github.com/krasimir/evala).

![Evala](./screenshot_1280x800.png)

It shows the time, it gets the weather forecast from [DarkSky](https://darksky.net) and third feature is my terminal. Right there, in the browser. Not like there are no extensions that provide the same but what I wanted was really these three things - clock, forecast and terminal.

Of course we can't fully implement the last bit without little help from the outside. That is why there is a [npm package called `evala`](https://www.npmjs.com/package/evala). Once installed we have an `evala` command available.

```
> npm install evala -g
> evala --shell=$SHELL
```

`--shell=$SHELL` argument is important one because otherwise we will end up using just `bash` (or `cmd.exe` under windows).

The `evala` command starts a web server that listens at `9788` port. In fact the whole app is available at http://0.0.0.0:9788 and we can open it as a regular web page.

The browser extension connects to `9788` port to get an access to a spawn shell and basically provide the same experience like I use iTerm.


