---
layout: article
title: Object-Oriented Design (OOD)
strapline: After reading through Sandi Metz' book Practical Object-Oriented Design in Ruby I wanted to make sure I put down in a blog post (a distilled) break-down of all the great advice she provides (note that this post is mainly for my own reference/reminder, I strongly recommend you read the book as there is so much more you'll gain from reading the book compared to this post)
---

All of the following information has been distilled from Sandi Metz' [Practical Object-Oriented Design in Ruby](http://www.poodr.info/), and although the code in this post is based on the Ruby language, don't worry - the concepts are applicable for any object-oriented language.

I would highly recommend you read [Practical Object-Oriented Design in Ruby](http://www.poodr.info/) as the author goes into far more code detail and background information (as well as other subjects such as writing tests) which will better help you understand the concepts. But hopefully the following distilled version should be a sufficient starting point for you to start writing more flexible code.

###What we'll cover:

- Objects
- Class Analysis
- Dependencies
- Flexible Interfaces
- Duck Typing
- Inheritance
- Inheritance vs Composition
- Further good rules of development from Sandi Metz
- Summary

##Summary

Here is a quick summary for those of you who want a quick run down of what we're discussing in this post… 

- Decouple your code
- Describe your class to see if it does too much (e.g. use a single line description and try to avoid the words 'and', 'or' from occuring)
- Review each method - you may find it doesn't belong in your class
- Manage your dependencies
	- Look at the arguments you're passing around
	- Use dependency injection (don't hard code class names)
	- Avoid direct references to complex data structures (transform them into a more readable form)
	- Single Responsibility Principle (SRP)
	- Review comments to ensure their purpose and usefulness
		- Your commented coded could be better handled by moving into a separate method with a descriptive name
- Write more flexible interfaces
	- Object-Oriented code is more about the 'messages' sent between objects than the objects themselves
    - Think about the messages you want to send and create objects/interfaces to handle them
    - Ask for what you *want* and don't include *how* to do what you want
    - Ensure messages you send (e.g. method calls you make) don't rely on knowledge of the object that implements the method
    - Reduce your object's context (i.e. how much it knows about other objects). Dependency Injection can help here
- Trust your objects (e.g. Duck Typing design principles)
- If using the inheritance pattern:
    - Abstract your shared functionality into the base class
    - Make sure sub classes inherit only what they need
    - Avoid calling `super` as it's a code smell


##Objects

In one line… 

> Object-Oriented Design is about the messages that get sent between objects and not the objects themselves.

## Class Analysis

We want our classes to be as decoupled as possible. The benefit of this is to allow changes to occur over time with little to no side-effects. If your classes have too many dependencies tightly coupled to them then any design/code changes in the future could potentially have a negative knock-on effect on the rest of your code.

To ensure a class only contains the behaviour it needs try describing your class in one sentence. If you use "and" then the class more than likely has more than one responsibility. If you use "or" then the class has more than one responsibility and the responsibilities aren't even related. That would be an indication of a code smell.

Ask each method a question and see if any sound out of place.

e.g. "Please Mr. `ClassName` what is your `method_name`?"

For example… 

    class Gear
        attr_reader :chainring, :cog, :rim, :tire
        
        def initialize (chainring, cog, rim, tire)
          @chainring = chainring
          @cog       = cog
          @rim       = rim
          @tire      = tire
        end

        def ratio
          chainring / cog.to_f
        end

        def gear_inches
            # tire goes around rim twice for diameter
            ratio * (rim + (tire * 2))
        end
    end

…remember that `attr_reader` generates a getter method and those count too… 

- "Please Mr. `Gear` what is your `ratio`?" **- fine**
- "Please Mr. `Gear` what is your `gear_inches`?" **- fine**
- "Please Mr. `Gear` what is your `tire`?" **- hmm? notice this doesn't sound like it quite fits the purpose of a 'Gears' class**

Also ensure that a class accesses attributes/properties via a getter method rather than directly accessing them… 

    class Gear
        attr_reader :chainring, :cog
        
        def initialize (chainring, cog)
          @chainring = chainring
          @cog       = cog
        end

        def ratio
          @chainring / @cog.to_f # bad
          chainring / cog.to_f   # good
        end
    end

##Dependencies

Dependencies can be many things, for example: external class references or arguments passed to methods.

Below are some rules to help you spot a dependency and how to better manage them… 

- ###Direct References

	Avoid 'direct references'. These are things like drilling down into a complex array structure to grab some data to work with. You may know the data structure now, but that's not to say it won't change in the future. But also, linking to a complicated data structure is confusing to new users because it obscures what the data really is. 

    So in the following example we are accessing `item[0]` and `item[1]`… 
    
        #BAD
        class MyClass
            attr_reader :data
            
            def initialize(data)
                @data = data
            end

            def do_something
                data.each do |item| 
                    puts item[0]
                    puts item[1]
                    puts '---'
                end
            end
        end

        obj = MyClass.new([[10, 25],[3, 9],[41, 7]])
        obj.do_something
    
    …but the order of the items may not always be what you think they are and the direct access is not very descriptive of what the data is that you're accessing. 
    
    Instead you should 'transform' your data structure into a simpler and easier to understand structure (you can do this in Ruby using `Struct` which is great for creating basic data classes)…

        #GOOD
        class MyClass
            attr_reader :new_data
            
            def initialize(data)
                @new_data = transform(data)
            end

            def do_something
                new_data.each do |item| 
                    # now we are able to reference easily understandable 
                    # property names (rather than item[0], item[1])
                    puts item.coord_x
                    puts item.coord_y
                    puts '---'
                end
            end

            Transform = Struct.new(:coord_x, :coord_y)
            
            def transform(data)
                data.collect { |item| Transform.new(item[0], item[1]) }
            end
        end

        obj = MyClass.new([[10, 25],[3, 9],[41, 7]])
        obj.do_something

- ###Single Responsibility Principle
	
	You should refactor your methods so they do one thing (also known as the 'Single Responsibility Principle'). One reason for this is that methods become easier to test, but also it means their simplicity provides a greater clarity that can highlight whether certain methods should even be a part of your class. 

	So for example, you may include a complex algorithm within a single method of your class and because of its complexity you may miss the fact that some of the algorithm should actually have been handled by a separate class altogether.
	
	Following the Single Responsibility Principle will result in smaller (and greater number of) small sized methods. This result will encourage greater code reuse from yourself as well as other users of your code and will also make your methods easier to test and to move around into different classes.

- ###Remove comments

	If a piece of code needs a comment then chances are you need to extract that code into a separate method. The name of the method should serve the same purpose as the comment once did. This isn't always the case, but as part of your analysis you should reconsider any comments to ensure they are helpful or just noise.

- ###Do not tightly couple your code

	Do not tightly couple your code. The best way to decouple your code is to manage your dependencies. 

	For example, if you look at a class that utilises another class for some additional functionality, that secondary class has become the dependency. Also, if you use that dependency in multiple places and the class was to change in some way then how many places would your class potentially break or need to be updated? 
	
	A class referencing the name of another class isn't necessarily a major issue in itself (as the change of a class name can easily be rectified using a modern IDE find & replace feature), the bigger problem is from the lack of code reuse. Your method is tightly coupled to a specific class. 
	
	Some other things to look out for are: arguments passed to a method on the dependency class (if the class name itself is hard coded then technically that is an area of concern as well - if the dependency class was renamed then your code which references the old name would need to be updated). Even down to things like the order of the arguments could be considered a dependency. Every dependency results in more brittle, tightly coupled code. 

- ###Facade

	Do not let external dependencies to permeate your code. 
	
	One way to prevent this is to wrap any dependencies in a method so you can implement a facade over the original interface allowing it to match your own API.
	
	For example, the argument order passed to a method can be normalised via a facade that accepts arguments as a hash.

- ###Dependency Directions

	Make sure you spend time considering the direction of your dependencies.

    When considering the direction of your dependencies (e.g. does class A rely more on class B, or vice versa) remember to think about the following 3 points…

    1. Some classes are more likely to change than others

    2. Concrete classes are more likely to change than abstract classes (this relates to a previous example where a class originally had a hard coded reference to another class. We made the primary class more abstract by injecting the  dependency of the secondary class rather than reference it directly - this way the primary class was able to accept an object successfully as long as it implemented the required method).

    3. A class with many dependants could result in widespread consequences.

###Summary of dependencies...

- Dependency management is core to creating future-proof applications. 

- Injecting dependencies creates loosely coupled objects that can be reused. 

- Isolating dependencies allows objects to adapt to unexpected changes. 

- Depending on abstractions decreases the likelihood of facing changes. 

- The key to managing dependencies is to control their direction. 

And to quote another… 

> "Depend on things that change less often than you do"

##Flexible Interfaces

Object-Oriented applications are made up of objects(classes) but are defined by the messages that pass between these objects. 

Our code must handle…

- What objects *know* (i.e. their responsibility)
- *Who* they know (i.e. their dependencies)
- *How* they talk to one another

…and this is done via our object's interfaces. 

Creating a flexible interface is essential to good Object-Oriented design. 

Each object should reveal as little about itself, and know as little about other objects as possible. 

There are two parts to our interfaces: a Public Interface and a Private Interface… 

###Public interface:

- Should reveal the primary responsibility 
- Is expected to be invoked by others
- Will be unlikely to change (so safe for other objects to depend on)
- Testable

###Private interface

- Should handle implementation details
- Not be accessible by other objects
- Can be changed at anytime without causing side effects for other objects
- Aren't even accessible by unit tests

A good way to start designing your interfaces is to draw sequence diagrams (one way is to use UML). Remember to focus on the messages between objects rather than the objects themselves.

When designing your interfaces you need to ask yourself the question: "I need to send this message, who should respond to it?". You don't send messages because you have objects, you have objects because you send messages. This way you can ensure your objects only handle responsibilities relevant to them.

Avoid asking the question "What should this class do?". 

Make sure your interfaces are designed in such a way that they ask for what they want and don't tell another object what to do. 

For example, If you have a Mechanic class then don't call its methods "clean_bike", "pump_tyres", "check_brakes" directly. Instead call a single method call "prepare_bike". This way if the mechanic object changes it's implementation then the object that calls "prepare_bike" doesn't have to change as well. 

###Reducing Context

The things an object knows about other objects make up its 'context'. 

An object may have a single responsibility but it expects a context. For example the object expects an object to respond to a specific method call. 

For an object to become more reusable and more easily testable it must reduce its contexts. If there is a context then to reuse the object you need to bring along the context every time (this makes code reuse and testing harder). 

Dependency injection reduces the context. If the object called a generic method and passed 'self' as an argument then the receiving object could handle the request and (because the first object was injected as a dependency) then the second object could call the first object when it's finished with the request. 

###Summary of Interfaces

Your interface defines your application and determines its future. 

Object-Oriented applications are defined by messages that pass between objects. This is handled via public interfaces. Ask for what you want and don't include any 'hows' as part of the request which would be telling the receiving object how to behave rather than it handling the how itself. 

##Duck Typing

Duck Typing is the process of making code more flexible and less tightly coupled by taking into consideration that if an object "sounds like a duck, and quacks like a duck" then it stands to reason the object must indeed be (or act like) a duck.

The principle idea behind Duck Typing is to trust your objects (e.g. do not worry about the class of an object, only that the object implement the expected interface - and trust that it does). Sounds scary/dangerous but it will help you to avoid writing code that tightly couples to your dependencies. 

Cleaning up a long and ugly switch/case statement which checks the class of an object to determine what action to take is one area where Duck Typing can help. The problem with this example is that the switch statement technique is fragile and likely to break when new class types need to be added. 

Instead, for each object create a generically named method (same name for each object) which handles the appropriate internal/specific details relevant for that object. This way you can just call the method (and even pass the calling object as a reference `self` in case the receiving object needs further information to carry out its work) and thus make your code more reusable by not tightly coupling a specific method to multiple object calls. 

Also, any where you see the use of `is_a?` or `responds_to?` then that is an indication of a potential code smell because the principle issue identical to the switch statement. 

##Inheritance

###Abstract your base class

When inheriting from another class it is essential that the parent class is as abstract as possible. For example, it only holds enough code that is relevant for all its sub classes. A sub class should never inherit redundant data or methods. If it does then your parent class isn't abstract enough. 

###Default values

Be careful when using default values. If your base class has a common property which is different for each sub class, but is required within each sub class (hence sticking it in the base class) then you won't want to give it a value inside the base class. Your base class should take in the value via the constructor and if the value isn't provided you should set the default using a method like so...

`xxx = args[:xxx] || default_xxx_value`

In this example `default_xxx_value` should be a method the sub class implements which provides the specific value. The reason we have written it like this is so that the sub class has better control over setting the default value. 

So far so good. But if a new user doesn't read the documentation (which states they must implement `default_xxx_value` within their sub class) then they will get an error thrown. In the above example it may be best to raise your own descriptive error by implementing the `default_xxx_value` method as an abstract method within the base class like so...

    def default_xxx_value
        raise NotImplementedError, "#{self.class} cannot respond to: "
    end

Note: the above custom error message raised will display automatically the name of the method (`default_xxx_value`) at the end of the message when it is displayed to the user (hence we don't need to manually include it). 

###Super

Beware calls to `super` via a sub class, as this is a code smell. 

Why? Because it declares that the sub class knows the implementation of the base class. It says "I know what you do, I know what to send to you and I know what returned value to expect". The sub class has more context than it should do and we've created a dependency. 

In this example the sub class knows too much about the base class and so it is tightly coupled to it. If a new developer joins the project and creates a sub class, but doesn't call `super` at the appropriate time, then they would likely have a silent failure (or at least one that could be difficult to resolve).

To resolve the concern of using `super` we can use a 'hook message' which effectively allows the sub class to stay decoupled from the base class. The sub class needs to be able to trust that the base class will do the right thing (which in this case is call a method). 

The way the hook method works is you remove the constructor from the sub class and move the sub class specific constructor code into a separate method of the sub class called `post_initialise` (or whatever you want to call it). The base class' own constructor will be run when a new instance of the sub class is created but now the base class constructor will updated so it calls the `post_initialise` method at the end of its constructor (this means the base class needs to implement an empty `post_initialise` method which the sub class then overwrites). 

Now the sub class doesn't know about the base class other than it inherits from it and the interface contract between them states the base class will at some point call `post_initialise` whenever it's ready to do so and the sub class takes over from there. It's now clear that the sub class is just a specialised version of the base class.

This works with other methods not just the constructor. The base class could have...

    def spares
        { tyre_size:tyre_size }.merge(local_spares)
    end

...the sub class can then implement its own `local_spares` method which returns a hash. So when a user creates a new instance of the sub class and calls the `spares` method then the base class handles the functionality, the sub class can insert its own specialised data without knowing how the base class works (other than the interface design requires the sub class should implement a method called `local_spares`). 

###Modules

Objects have a tendency to play a role, and some objects play a similar role to other objects. They may not necessarily be a specialised version of another object though and so shouldn't inherit functionality via the inheritance pattern. 

Instead we can use modules as 'mixins' which will let these objects (those with similar roles) share behaviour. 

Modules are placed inside the same lookup path as methods acquired through inheritance, so the principles for developing modules should follow those of writing classes: use the Template Method Pattern. 

For example, any object which includes the module needs to provide their own specialisation of a hook method implemented in the module. This means an object which includes the module doesn't have to create a dependency by calling `super`, thus avoiding needing to know anything about the included module (other than its implied interface contract). 

###Composition

The composition pattern is effectively the same as using modules (where you copy in functionality rather than inheriting it - thus creating a '*has-a*' relationship rather than a '*is-a*' relationship). 

But composition from a design perspective is more about the resulting 'whole', than the subsequent parts that make up the whole. 

##Inheritance vs Composition

Inheritance is the more appropriate solution if your design dictates that the objects have a well defined concrete class of functionality and that most of that base functionality is the same for all other objects. With inheritance you would write only small amounts of new code to extend the base functionality so the extending objects become more specialised.

> Inheritance is specialisation  
*Bertrand Meyer, Touch of Class*

If on the other hand your objects are all different and the design of the objects dictates there could be multiple reusable 'parts', then composition would be the better solution.

> Use composition when the behaviour is more than the sum of it's parts  
*Grady Booch, Object-Oriented Analysis and Design*

##Further good rules of development from Sandi Metz

1. Your class can be no longer than a hundred lines of code.
2. Your methods can be no longer than five lines of code
3. You can pass no more than four parameters (do not make it one big hash either).
4. In your controller, you can only instantiate one object, to do whatever it is that needs to be done.
5. Your view can only know about one instance variable.
6. Rules are meant to be broken if by breaking them you produce better code. [ ...where "better code" is validated by explaining why you want to break the rule to someone else. ]

##Summary

So just to quickly recap on some of the important points covered… 

- Decouple your code
- Describe your class to see if it does too much (e.g. use a single line description and try to avoid the words 'and', 'or' from occuring)
- Review each method - you may find it doesn't belong in your class
- Manage your dependencies
	- Look at the arguments you're passing around
	- Use dependency injection (don't hard code class names)
	- Avoid direct references to complex data structures (transform them into a more readable form)
	- Single Responsibility Principle (SRP)
	- Review comments to ensure their purpose and usefulness
		- Your commented coded could be better handled by moving into a separate method with a descriptive name
- Write more flexible interfaces
	- Object-Oriented code is more about the 'messages' sent between objects than the objects themselves
    - Think about the messages you want to send and create objects/interfaces to handle them
    - Ask for what you *want* and don't include *how* to do what you want
    - Ensure messages you send (e.g. method calls you make) don't rely on knowledge of the object that implements the method
    - Reduce your object's context (i.e. how much it knows about other objects). Dependency Injection can help here
- Trust your objects (e.g. Duck Typing design principles)
- If using the inheritance pattern:
    - Abstract your shared functionality into the base class
    - Make sure sub classes inherit only what they need
    - Avoid calling `super` as it's a code smell