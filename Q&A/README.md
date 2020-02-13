### What is Node js, Exactly?
* Node js is a server side javascript runtime environment
* V8 is the car's engine and drivetrain
* Node.js is everything else that makes the car.
* Developer is the Driver
* Node.js is a C++ application that embeds the V8 js engine.
* Node.js now presents itself as two applications:
  * A REPL(Read Evaluate Print Loop).
    * The repel works much like the `consol` within a web browser.
    * It's a way to define and execute javascript code against the V8 engine in realtime.
    * You can start node REPL using `node` command.
    * The REPL is an interactive JS runtime.
    * You can write any javascript you want, and have it executed.
    * You can define and execute whatever *[Variables, Functions, Asynchronous tasks]* what you want in REPL.
  * A script processor.
    * Script processor is called using command `node {script name}` for Example `node index.js`
    * When you invoke the node programme this way node isn't going to pass your javascript code to V8, the process is more complex than that.
      * First it is going to initialize a process called the **Event Loop**.
      * Then, it's going to process the initial parts of your javascript file.
      * Then, it is going to start processing the *Event loop* that was initialed earlier.
      * You can think of the *Event Loop* as an infinitely repeating task that starts over just as soon as it complete.
      * **Event Loop** is continually checking if there's anu new tasks for Node.js to do.
      * Recall that javascript can include both Synchronous and Asynchronous behaviors.
      * Synchronous behaviors are *executed and completed* by node as soon as they are encountered.
      * Asynchronous behaviors are simply invoked but not immediately completed, instead these behaviors just get added to a queue which list everything that Node.js has left to do.
      * The Event Loop is Node's way to process that To Do List.
      * Every time the Event Loop runs the number of items left to complete may just stay the same or it may grow.
      * If at some point the Event Loop checks off the final thing it has to do on it's to do list the application exits.
      * If each task on the list created a new task then the length of the To Do list never reach zero, so it's possible for node to run infinitely and never reach a point where it needs to exit.
      * Many node programmes like servers or background workers are designed this way, to perpetually create more items on the To Do list and never let the To Do list get down to Zero, that way the application never dies.
      * Non-blocking tasks *[callbacks and scheduled like timeout and interval]* get added to the todo list, and Node processes them whenever it can.
      * Web Apps often need to handle and process multiple things at a single time, while your API is fetching database results for one user's request it must also be simultaneously sending a welcome email to another user and looking for a twitter account of another or charging a credit card of another.
      * Node's event loop and "non blocking" IO don't allow Node to do multiple things at one time, it just allow node to schedule things later.
      * In Web applications, when processing a request, most web apps are actually sitting around waiting (other thing doing another thing) for most of the time.
      * A Non blocking IO allows an app to do other things while it's sitting around waiting.
      * Node.js is continually getting out of it's own way, when it encounters anything that would normally require blocking the thread and waiting around doing nothing, Node is designed to move that task out of the way and then do it at some point when it has some down time.
      * Node is much better at managing it's own time, it's constantly re-prioritizing the tasks in front of it so it's never sitting around waiting at a time when it could be actually doing something.
      * Many of the Node APIs such as *writing to desk* are designed Asynchronously in this way.
    * In summary: Node's script processor: 
      1. Reads in the file you specify.
      2. Reads in all the dependencies that file specifies, and all the dependencies of those files,etc.
      3. Begins executing the synchronous tasks in those files.
      4. Begins processing the **todo list** by repeating the event loop until it has noting to do. 
  
#### How Node Modules really work?
* Node's Module system creates a *dependency tree*, which tells Node which files are needed to run the application.

