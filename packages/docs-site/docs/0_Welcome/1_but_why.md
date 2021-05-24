---
title: Why another framework?
description: Remastered is not the first full-stack React framework. There are multiple of frameworks claiming to this title. So why building another one?
---

Remastered is not the first full-stack React framework. There are multiple of frameworks claiming to this title, although most of them don't really fit to this definition. So why building another one?

I have been a long-time [Next.js] user. I used it on personal projects for small React stuff and in a work project mostly for its file-system routing. It always felt like Next.js is _almost_ good for me, but it seemed that Next's focus is on front-end, and not on the entire stack. This is why on many of my side projects I still tend to go with [Ruby on Rails].

After seeing the Remix beta launch, I was excited. Finally, a framework that looks like what I've been looking for: powered by React (but could be powered by anything else, frankly), focused around HTTP and not `useEffect` with loading spinners flying everywhere. Write synchronous code as if we were in the 90s, but get the user experience of the modern age with progressive enhancement. That's the dream!

The core ideas introduced by Remix sound interesting and I figured out it would be very fun to do a fresh take on them using [Vite] as a bundler. A couple of weeks playing with it, understanding how it works internally and voilà! I had a working prototype.

I think that if we embrace "magic" and conventions, we can achieve great developer experience. I think this is something we miss in the JavaScript ecosystem. And I wish to make it a reality.

At least for my future side-projects (and maybe my work projects).

[next.js]: https://nextjs.org
[vite]: https://vitejs.dev
[ruby on rails]: https://rubyonrails.org
