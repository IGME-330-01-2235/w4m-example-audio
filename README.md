# Individual Part Volumes

Now we can reap the benefits of the refactor.

In `Part.ts` we can add a GainNode, which will control the volume for that specific part. We also add some extra HTML in `expandMarkup()` to make a label, range input, and event listener for the Part.

And because we did all this in the class, we only had to write it once for all four parts!
