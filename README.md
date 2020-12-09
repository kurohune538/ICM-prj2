# Purpose
I want to make an interactive audio visualizer. Because audio visualizer includes some part of VJ and DJ elements.

So If I make the interactive audio visualizer, I can play VJ and DJ with other audience.


## Project1
At first, I made an audio visualizer itself.

First of all, I use `p5.FFT()` for detecting the frequency values of sound.

I use trigonometric function for mapping the FFT values to circular visualizer.

<img width="726" alt="スクリーンショット 2020-12-08 21 37 04" src="https://user-images.githubusercontent.com/8509325/101566856-bee10a00-399d-11eb-9004-52f6ef89fd55.png">



## Project2
Next step, I tried to add some interaction to my audio visualizer.


I tried to use my own face as a filter of the song. 

When I open my mouse, the high pass filter turns on and changes the strength according to my mouse size.

I did that by using ml5.js face api functions.

![image](https://user-images.githubusercontent.com/8509325/101567112-3a42bb80-399e-11eb-8848-528a914e94e7.png)

And also sound position changes according to my mouse position.

At last, I could use my face to filter my song and add some interactions to my visualizer.


## Project3

I want to add the function for audience to enjoy my audio visualizer together.

So I used websocket to connect each other and I made an interface for participating the audio visualizer.
![image](https://user-images.githubusercontent.com/8509325/101567668-3ebba400-399f-11eb-8c95-1ff17bd384ee.png)

You can join my visualizer from here!! (https://icm-audience.vercel.app/)

So I made three repository including this. One is for the audience page and another is for the server-side.

(I used Next.js for audience page and I used heroku for deploying my server-side page)

Audience Page(https://github.com/kurohune538/icm-audience)

Socket Repository (https://github.com/kurohune538/icm-socket)



