# grandMA3-Chataigne-Module

A Chataigne module to control grandMA3 via OSC

## Purpose

This Chataigne module facilitates the mapping of external sources to grandMA3 via the OSC interface. The faders and buttons of executors as well as directly of sequences can be changed. Of course there is also a function to send commands (cmd) to grandMA3. For all those who only use an onPC node there is the possibility to toggle "blind" and "freeze" and display the status for example on a midi controller.

## Usage

Activate OSC in grandMA3 in the "In & Out" menu. The OSC input must be activated globally (top right) and an input source must be created. The screenshot shows a simple configuration as an example.

![screenshot](https://github.com/yastefan/grandMA3-Chataigne-Module/blob/main/screenshot.png)

## Known issue

Unfortunately, controlling sequences with grandMA3 version 1.7.2.0 is currently not possible. Probably it is a bug in grandMA3 and will be fixed. The bug report was sent to LightPower. If this feature is needed an old version of grandMA3 incl. 1.6.3.5 can be used. 
