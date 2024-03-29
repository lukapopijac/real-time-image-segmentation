Real-Time Image Segmentation
============================

[Image segmentation](http://en.wikipedia.org/wiki/Image_segmentation) is
the process of partitioning a digital image into multiple segments. This
project deals with image segmentation of directly streamed video from a
webcam in real-time.

Try the app: [Real-Time Image Segmentation](https://lukapopijac.github.io/real-time-image-segmentation/)

The whole application runs in the browser. There is no communication with the
server whatsoever (other than initial page load, of course).


Dependencies
------------
 *  Node.js
 *  npm


How To Run and Develop
----------------------
To build the project with watcher, and run local server over `http`, run:
```
npm start
```

If you just want to start a local `http` server, run:
```
node server
```

If you just need to build the project and start watcher:
```
node build
```

Buildig the project means creating folder `build` and placing in it all
the neccessary files needed to run the project in browser.



About the Implementation
------------------------

In order to maintain undistracted video streaming from the webcam, streaming
is done in the main thread while segmentation is done in the background thread.

Image is converted to weighted graph. Pixels are represented by nodes and
neighbor pixels are connected with an edge. Weights of the edges are determined
by calculating similarity between pixels.

Next, segmentation is done by grouping similar pixels. Algorithm for grouping
is similar to Kruskal's algorithm for finding minimum spanning tree. The
difference is that every time when two sets are to be connected, a test for
similarity between them is being done. Similarity test is done by subtracting
average colors between sets and comparing the difference with the threshold.
(Mahalanobis and Bhattacharyya distance have been tried here, but there was
no obvious advantage and there was a great performance disadvantage of using
those).

Union-find data structure is implemented by using typed array to achieve
performance boost.

Overall complexity of the algorithm is _O(n&middot;&alpha;(n))_, where _n_ is
a number of pixels, and _&alpha;(n)_ is the inverse of the single-valued 
Ackermann function. Given that _&alpha;(n)&lt;4_ for any practical value
of _n_, we have amortized linear time complexity.



License
-------

This software is released under the MIT license.
