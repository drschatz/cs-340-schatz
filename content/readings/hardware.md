---
title: Hardware Introduction
author: Luther Tychonievich and Jule Schatz
---

The purpose of this page is to skim through key ideas in digital hardware at a level of detail that will hopefully communicate the idea "nothing is magic, everything is designed by regular people."

# Electricity primer

Electrical **current** is the flow of electrons across a conductor. More electrons per second = more current.

Electrical **voltage** is the force gradient that causes electrons to want to move. It is similar to pressure, but for electrons instead of fluids.

Electrical **resistance** impedes current. Because resistance exists (except in superconductors, but they are not yet common in computers), current requires some voltage, with more voltage needed if there is more resistance.

Electrical **power** is *current × voltage*.

Resistance converts power into **heat**. Heat in turn increases **temperature**. Computer components tend to fail if the temperature rises too high, so heat sinks (devices to move heat off of the computer) are key to running computers quickly.

# Transistors

Transistors act like electrical valves. Each is connected to three wires. Applying voltage to one wire (which is a dead-end wire and cannot accept current) changes whether the other two wires are connected (allowing current to flow) or not by changing the resistance of the connection between those two wires.

Transistors are designed to operate at a specific voltage, the voltage needed to reliably change connectivity. Lower voltages don't operate and higher voltages can damage or break the transistor. We commonly call voltage high enough to engage a transistor "high," "1," or "voltage" and voltage too low to engage a transistor "low," or "0," or "ground."

There are two types of transistors. Some allow current *unless* there is voltage and others allow current *only if* there is voltage.

There are multiple drawings used for transistors. We'll use a T-shaped wire for the voltage control wire almost touching an offset jig connecting the current wires, with a circle at the join of the T for transistors that allow current with no voltage and no circle for transistors that allow current with high voltage.

# Gates

Small numbers of transistors are commonly arranged between a voltage source and ground to have specific properties. These generally have a few input wires that need to be connected to voltage sources and a few output wires that receive voltage. We call these common arrangements "gates."

With a little design work, we can create gates from transistors that mimic any 1-, 2-, or 3-input truth table, including and, or, xor, not, implication, bi-implication, and so on. Chaining these gates together, we can create any Boolean expression with any number of arguments.

