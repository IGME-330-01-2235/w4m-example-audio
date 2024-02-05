# Refactor : Part Setup

I got tired of writing everything four times. So I made a `Part` class to encapsulate the behavior of a voice part.

Check out the [diff](https://github.com/IGME-330-01-2235/w4m-example-audio/commit/89f5f640fac3e405b368ed462eec7f9ae8dcf732) to see what the refactor looks like.

Check out [src/Part.ts](https://github.com/IGME-330-01-2235/w4m-example-audio/blob/audio-03/src/Part.ts) to see what the class looks like.

This refactor sets us up to do interesting things with the markup and more effects nodes (without having to repeat ourselves four times). Note, I removed the earlier comments and left new ones for the things that have changed.
