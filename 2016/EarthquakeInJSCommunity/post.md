You probably heard about [Kik, NPM and left-pad](http://www.theregister.co.uk/2016/03/23/npm_left_pad_chaos/?mt=1458733182820) saga this week.[STOP]

A company [Kik](https://www.kik.com/) asked a developer <a href="https://twitter.com/azerbike">Azer Ko&ccedil;ulu</a> to give the ownership on a [NPM](https://www.npmjs.com/) module. The module name matches the name of the company. The developer refuses and the company reaches the registry (NPM). The module was transfered to the company based on a NPM policy. The developer then decided to remove all his modules from the registry. The bad thing is that one of these modules `left-pad` is a dependency of many other modules. As a result of the un-publishing all the packages that depend on `left-pad` can not be built. Some really popular tools like Babel and React started getting failing builds. 

All the parties:

* [Azer's point](https://medium.com/@azerbike/i-ve-just-liberated-my-modules-9045c06be67c)
* [Kik's response](https://medium.com/@mproberts/a-discussion-about-the-breaking-of-the-internet-3d4d2a83aa4d#.t4rrly86w)
* [NPM's response](http://blog.npmjs.org/post/141577284765/kik-left-pad-and-npm)

To be honest I can't take a side because I didn't read the TM of NPM and I have no idea how such cases are handled in US. However, I see that there are some [really wrong interpretations](http://uk.businessinsider.com/npm-left-pad-controversy-explained-2016-3?r=US&IR=T) of the situation. And I feel that we need to clarify few things:

* No one broke the Internet. The un-publishing of NPM module broke the building process of JavaScript libraries. That's definitely not breaking the Internet. The worst thing that could happen is not getting your JavaScript bundle which means that you can't deploy your application. Even if this happens there are workarounds.
* No one broke Node. Node as an environment is stable and it works as expected.
* The dispute between Azer and Kik is unclear and it is maybe a matter of policy and trademark documents. The real problem is in Node's package manager. Not the company NPM but the package manager and how it is designed. Maybe we shouldn't be able to un-publish a package if it is used by someone or there are dependent modules. Maybe we should install packages in the format of `@owner/module` then we could have `@kik/kik` and `@azer/kik` coexists.

I think that no one installs modules blindly. No one is going to run `npm install kik` without checking what's the content of the package. I wish Kik simply created `kik-chat` and not bother with a single developer or going to NPM. If there is a law that forces them to protect their brand and they really *must* own `kik` then probably their actions are not so weird. 

P.S.
And I hope that their back-end is not written in Ruby because there is a [kik](https://rubygems.org/gems/kik) gem.