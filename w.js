(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
function generateEdges(r){for(var t=r.data,e=r.width,n=r.height,a=new Uint32Array(2*(e-1)*(n-1)),o=0,u=0;u<e-1;++u)for(var g=0;g<n-1;++g){var i=g*e+u,c=calculateWeight(t,i,i+1);a[o++]=c<<20|i;c=calculateWeight(t,i,i+e);a[o++]=c<<20|1<<19|i}return a}function calculateWeight(r,t,e){t<<=2;var n=r[e<<=2]-r[t],a=r[e+1]-r[t+1],o=r[e+2]-r[t+2],u=n*n+a*a+o*o>>4;return u<=1023?u:1023}function countingSort(r,t){for(var e=[],n=0,a=r.length;n<a;++n){var o=r[n],u=o>>>t;e[u]||(e[u]=[]),e[u].push(o)}var g=0;for(n=0;n<e.length;++n){var i=e[n];if(i)for(var c=i.length;c--;)r[g++]=i[c]}return r}module.exports=function(r){var t=generateEdges(r);return countingSort(t,20),t};

},{}],2:[function(require,module,exports){
"use strict";var imageGraph=require("./imagegraph"),structSize=6;function union(r,t,e){var i=t*structSize,a=e*structSize;if(r[i]<r[a]){var n=i;i=a,a=n,n=t,t=e,e=n}r[i]===r[a]&&r[i]++,r[a+1]=t,r[i+2]+=r[a+2],r[i+3]+=r[a+3],r[i+4]+=r[a+4],r[i+5]+=r[a+5]}function find(r,t){for(var e=t;;){if(r[a=t*structSize+1]===t)break;t=r[a]}var i=t;for(t=e;;){var a;if(r[a=t*structSize+1]===t)break;t=r[a],r[a]=i}return i}function myDistance(r,t,e){var i=t*structSize,a=e*structSize,n=1/r[i+2],u=n*r[i+3],o=n*r[i+4],c=n*r[i+5],f=1/r[a+2],s=u-f*r[a+3],v=o-f*r[a+4],g=c-f*r[a+5];return s*s+v*v+g*g}function segmentation(r,t,e){for(var i=r.data,a=r.width,n=r.height,u=a*n,o=new Int32Array(structSize*u),c=0;c<u;++c){var f=i[m=4*c],s=i[m+1],v=i[m+2],g=structSize*c;o[g+1]=c,o[g+2]=1,o[g+3]=f,o[g+4]=s,o[g+5]=v}for(var m=0;m<t.length;++m){var z=t[m],S=524287&z,d=524288&z?S+a:S+1;(S=find(o,S))!==(d=find(o,d))&&(myDistance(o,S,d)<e&&union(o,S,d))}return r.data.set(avgColorImage(o,a,n)),r}function avgColorImage(r,t,e){for(var i=new Uint8ClampedArray(4*t*e),a=0;a<t*e;++a){var n=find(r,a)*structSize,u=1/r[n+2];i[4*a]=u*r[n+3],i[4*a+1]=u*r[n+4],i[4*a+2]=u*r[n+5],i[4*a+3]=255}return i}module.exports=function(r,t){return segmentation(r,imageGraph(r),t)};

},{"./imagegraph":1}],3:[function(require,module,exports){
"use strict";var segmentation=require("./segmentation");self.addEventListener("message",function(e){var a=e.data.imageData,t=new Date;a=segmentation(a,e.data.threshold),self.postMessage({imageData:a,time:new Date-t})},!1);

},{"./segmentation":2}]},{},[3]);
