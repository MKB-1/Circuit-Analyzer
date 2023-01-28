
# DC Circuit Nodal Voltage Solver

  <p align="center">
    Has a rudimentary UI which lets user build a DC circuit by clicking tiles until they get their desired component. After circuit is built, the UI representation of the circuit is traversed by breadth-first traversal, in order to find the nodes and their connections. With this, a system of linear equations is created and solved via Gaussian elimination.
  </p>





<!-- ABOUT THE PROJECT -->
## About The Project
This was my first project ever made. I wrote this while I was still in Biochemistry, and was just watching youtube videos on how to code. I didn't use a graph because I didn't know what it was at the time. Instead it's all arrays and keeping track of indices.
It was a difficult project and took me a lot of time to figure out how exactly it was all going to work. In the end, it was a fun experience!


## How To Use

Draw a circuit by clicking on the tiles.
R -> Resistor
I -> Current Source
V -> Voltage Source
G -> Ground (Exactly 1 ground must exist. The node which contains G is a reference node and will have a node voltage of 0.)
. -> Wire (used to connect other components)

The direction of the voltage and current source cannot be changed, but they can have negative values (which is essentially the same as reversing their direction).
All components can only have 2 connections on opposite sides (i.e. North/South or East/West; North/East, North/West, South/East, South/West is invalid).
Only Wires may have more than 2 connections. Wires have no restrictions on the relative positions of the connections either.

### Example of a valid circuit
![DC CIRCUIT EXAMPLE](https://user-images.githubusercontent.com/45188433/215273141-776b5993-eb97-4b26-b804-16ae68fd3fe7.PNG)


### Built With

* JavaScript
* HTML
* CSS
