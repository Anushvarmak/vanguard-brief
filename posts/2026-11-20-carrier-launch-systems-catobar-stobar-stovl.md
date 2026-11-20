---
title: "Carrier Launch Systems Explained: CATOBAR vs STOBAR vs STOVL"
description: How aircraft carriers launch and recover combat jets. A clear engineering breakdown of catapults, ski-jump ramps, arrestor wires, and vertical lift.
date: 2026-11-20
image: /images/carrier-launch-systems-compared.svg
tags: Military, Defence, Aviation, Global Defence, Navy
---
An aircraft carrier flight deck is barely 300 metres long—about one-tenth the length of a standard land runway. Yet modern naval fighters weighing over 30 tons must accelerate to 260 km/h in two seconds to get airborne, and slam back down from the sky onto a pitching deck without crashing into the sea.

How navies solve this aerodynamic problem defines everything about an aircraft carrier: its size, its cost, how many weapons its fighters can carry, and whether it can launch fixed-wing radar planes or only helicopters.

Across the world's navies today, three distinct launch and recovery philosophies dominate: **CATOBAR**, **STOBAR**, and **STOVL**. In this explainer, we break down how each system works, their engineering trade-offs, and why different nations chose them.

## In 30 seconds

- **CATOBAR (Catapult Assisted Take-Off But Arrested Recovery):** Uses powerful steam or electromagnetic catapults to fling heavy fighters into the air, and steel arrestor wires to catch them on landing. Used by the US Navy, France, and China's newest *Fujian*.
- **STOBAR (Short Take-Off But Arrested Recovery):** Replaces catapults with an upward-curved bow ski-jump ramp. Fighters launch under their own engine power and land using arrestor wires. Used by the Indian Navy (*INS Vikrant*, *INS Vikramaditya*), China (*Liaoning*, *Shandong*), and Russia.
- **STOVL (Short Take-Off and Vertical Landing):** Aircraft roll down a short runway (often with a ski-jump) to take off, then hover like a helicopter to land vertically on the deck. Used by the UK Royal Navy (*HMS Queen Elizabeth*), the US Marine Corps on amphibious assault ships, Italy, and Japan.
- **The Core Trade-off:** CATOBAR delivers maximum fighter combat radius and allows heavy propeller radar planes (like the E-2D Hawkeye) to fly, but requires massive power, complex machinery, and huge hull tonnage. STOBAR and STOVL trade raw fighter payload for simpler, cheaper, and more robust carrier designs.

![Carrier Launch Systems Compared: CATOBAR vs STOBAR vs STOVL](/images/carrier-launch-systems-compared.svg)

*Architectural comparison of launch mechanisms, recovery wires, maximum takeoff weight impacts, and operating navies worldwide.*

---

## The Aerodynamic Challenge of Carrier Aviation

A Boeing F/A-18 Super Hornet or Dassault Rafale needs around 1,000 to 1,500 metres of runway on land to lift off with a full load of fuel and heavy anti-ship missiles. On an aircraft carrier, the takeoff run is compressed into just **90 to 120 metres**.

Lift is governed by airspeed over the wing:

$$\text{Lift} = \frac{1}{2} \cdot \rho \cdot V^2 \cdot S \cdot C_L$$

To create enough lift ($L$) to overcome the aircraft's weight before running off the end of the deck, the aircraft must either:
1. Be artificially accelerated to flying speed by an external machine (**Catapult**).
2. Use raw jet thrust while being pitched upward by a curved ramp to buy extra seconds to gain speed (**Ski-jump**).
3. Vector its engine thrust downwards to support its own weight (**Vertical thrust**).

Let us examine each approach in detail.

---

## 1. CATOBAR: The Heavyweight Standard

![Naval fighter preparing for steam catapult launch with blast deflector raised](/images/carrier-catobar-launch.jpg)

*Catapult launch: The aircraft's nose gear is locked into the shuttle track while steel jet blast deflectors shield the rest of the deck from afterburner heat.*

CATOBAR stands for **Catapult Assisted Take-Off But Arrested Recovery**. It is the gold standard for carrier aviation developed by the British Royal Navy and perfected at scale by the United States Navy.

### How Take-Off Works
The nose gear of the fighter is attached by a launch bar to a shuttle sitting in a deck slot. Behind the aircraft, a steel jet blast deflector (JBD) rises from the deck. The pilot turns on full afterburners while the brakes hold the plane. When the catapult fires:
- **Steam Catapults (C-13 series):** High-pressure steam gathered from nuclear reactors or boilers fills two massive underground cylinders, driving pistons down the track and accelerating a 33-ton aircraft from 0 to 260 km/h in 2.5 seconds over 90 metres.
- **EMALS (Electromagnetic Aircraft Launch System):** Fitted on the US Navy's *Gerald R. Ford* class and China's *Fujian* (Type 003), EMALS replaces steam pistons with a linear induction motor. Electromagnets energize sequentially along the track, pulling the aircraft shuttle forward with microsecond torque control. This reduces structural stress on airframes and allows the catapult to launch lightweight drones as easily as heavy fighters.

### How Recovery Works
The landing area is set at an **angled deck** (angled roughly 8 to 10 degrees away from the ship's bow). As the pilot approaches, the aircraft lowers a heavy steel tailhook. Across the deck are stretched three or four high-strength steel cables called **arrestor crossdeck pendants**, connected below deck to hydraulic braking engines.

![Aircraft tailhook snagging the arrestor crossdeck pendant during carrier recovery trap](/images/carrier-arrestor-wire-trap.jpg)

*Arrested recovery: The steel tailhook catches an arrestor wire, bringing a 25-ton combat jet from 240 km/h to a full stop in just 90 metres.*

The tailhook snags one of the wires (ideally the 2nd or 3rd wire), absorbing the fighter's kinetic energy and bringing a 25-ton jet from 240 km/h to a dead stop in just **90 metres and two seconds**. 

*(Crucially, the moment wheels touch the deck, the pilot pushes the throttles to full military power. If the tailhook misses the wires—called a "bolter"—the aircraft has enough thrust to immediately take off again from the angled runway and circle around).*

### Key Strengths & Limitations
- **Advantage:** Launches fighters at 100% Maximum Take-Off Weight (MTOW) with maximum internal fuel and heavy cruise missiles.
- **Strategic Superiority:** It is the only system that can launch heavy, low-thrust turboprop aircraft—specifically airborne early warning and control (AEW&C) planes like the **E-2D Advanced Hawkeye**. An E-2D flies at 25,000 feet, detecting low-flying sea-skimming missiles 400 km away. Without CATOBAR, a fleet must rely on smaller radar helicopters that fly lower and have much shorter radar horizons.

![E-2D Advanced Hawkeye airborne early warning plane on aircraft carrier catapult](/images/carrier-e2d-hawkeye.jpg)

*The Northrop Grumman E-2D Advanced Hawkeye: Heavy twin-turboprop airborne radar aircraft that can only be launched from catapult-equipped CATOBAR flight decks.*

- **Drawback:** Enormous complexity, high construction cost, requires 75,000+ tons displacement, and demands immense power generation.

---

## 2. STOBAR: The Ramp & Wire Balance

![Naval fighter launching off ski-jump flight deck ramp with afterburners glowing](/images/carrier-stobar-ski-jump.jpg)

*Ski-jump launch: The upward curved bow ramp lofts the jet into a parabolic climb, buying vital seconds for the engines to accelerate to flying speed.*

STOBAR stands for **Short Take-Off But Arrested Recovery**. It was pioneered by the Soviet Union for the *Kuznetsov* class and is the operational bedrock of both the Indian Navy (*INS Vikramaditya* and *INS Vikrant*) and the Chinese Navy (*Liaoning* and *Shandong*).

### How Take-Off Works
There are no catapults on a STOBAR ship. The aircraft lines up on the runway against mechanical wheel chocks with its jet blast deflector raised behind it. The pilot engages full afterburners. When the engines achieve maximum stabilized thrust, the chocks drop.

The jet accelerates down the deck entirely under its own power. At the bow, it hits an upward-curving ramp angled between **12 and 14 degrees** (the ski-jump). 

The ski-jump acts as an aerodynamic ramp:
1. It physically launches the jet upward on a ballistic parabolic arc.
2. Even though the aircraft is traveling at only ~180 km/h as it leaves the deck (below normal flight stall speed), the upward trajectory gives the aircraft 2 to 3 seconds of climbing time without losing altitude.
3. During those 2 to 3 seconds, the powerful jet engines continue accelerating the plane until it achieves true aerodynamic flying speed.

### How Recovery Works
Recovery is identical to CATOBAR: the fighter extends an arrestor tailhook and catches one of three hydraulic arrestor wires on an angled flight deck.

### Key Strengths & Limitations
- **Advantage:** Eliminates the hundreds of tons of steam piping, water desalinators, high-pressure boilers, and electromagnetic capacitors required by catapults. Highly reliable, simpler to maintain at sea, and lowers overall carrier procurement cost.
- **The "Weight Penalty":** Because the jet must generate all of its launch acceleration from its own engines, its Maximum Take-Off Weight is constrained. On high ambient temperature days in tropical waters (like the Arabian Sea or Bay of Bengal), air density drops, meaning fighters often have to take off with partial fuel loads or lighter air-to-air payloads, relying on mid-air buddy refueling after takeoff.
- **No Heavy AEW&C Planes:** Propeller-driven planes like the E-2D Hawkeye cannot achieve the thrust-to-weight ratio needed to clear a ski-jump. STOBAR fleets must use airborne radar helicopters like the **Kamov Ka-31** or **MH-60R**, which have smaller radars and lower endurance.

---

## 3. STOVL: Vertical Flexibility

![F-35B Lightning II hovering over aircraft carrier flight deck with vertical lift-fan open](/images/carrier-stovl-f35b-hover.jpg)

*Vertical landing: An F-35B hovering motionless over the deck before touchdown, with its rear vectoring nozzle pointed 90° down and lift-fan hatch open.*

STOVL stands for **Short Take-Off and Vertical Landing**. Originally developed in the 1960s for the British Hawker Siddeley Harrier, it has reached its modern peak with the supersonic fifth-generation stealth **Lockheed Martin F-35B Lightning II**.

### How Take-Off Works
The aircraft initiates a short rolling takeoff run along a flat deck or over an upward ski-jump (the UK's *HMS Queen Elizabeth* uses a 12° ski-jump for the F-35B). As it rolls:
- The main engine exhaust nozzle rotates downward up to 90 degrees.
- On the F-35B, a massive mechanical clutch engages, spinning a vertically mounted counter-rotating **lift-fan** located directly behind the cockpit.
- Roll control ducts open under each wing, bleeding bypass air to balance the plane.

The combination of rolling aerodynamic wing lift and downward engine thrust lofts the aircraft into the air in under 150 metres.

### How Recovery Works
There are **zero arrestor cables** on a STOVL deck. To land, the fighter approaches the ship along the port side, matches the carrier's speed, slides horizontally over the landing spot, hovers stationary in mid-air, and gently descends vertically onto the heat-resistant flight deck.

### Key Strengths & Limitations
- **Advantage:** Eliminates both catapults *and* arrestor wires entirely. This drastically reduces ship deck maintenance and allows 25,000 to 45,000-ton amphibious assault ships (such as US Navy *Wasp* and *America* class LHDs, Italy's *Cavour*, and Japan's *Izumo* class helicopter destroyers) to be converted into genuine aircraft carriers carrying 5th-gen stealth fighters.
- **Drawback:** The vertical lift fan, clutch, and drive shafts are heavy dead-weight during normal flight, reducing internal fuel capacity and range compared to conventional carrier fighters. Furthermore, vertical landing requires the aircraft to be light enough to hover: if a pilot returns with unexpended heavy bombs, they may have to jettison expensive munitions into the sea before landing ("bring-back weight limit").

---

## Technical Comparison Table

| Metric | CATOBAR | STOBAR | STOVL |
|---|---|---|---|
| **Take-off Aid** | Catapult (Steam / EMALS) | Bow Ski-Jump (12°–14°) | Rolling run with vectored thrust |
| **Landing Aid** | Arrestor Wires (Tailhook) | Arrestor Wires (Tailhook) | Vertical hover touchdown |
| **Carrier Tonnage** | 75,000 – 100,000+ tons | 40,000 – 65,000 tons | 25,000 – 65,000 tons |
| **Fighter Payload / Fuel** | **100% (Maximum)** | ~70% – 85% (Thrust limited) | ~75% – 85% (Hover limited) |
| **Fixed-Wing AEW&C?** | **Yes** (E-2D Hawkeye) | **No** (Helicopters only) | **No** (Helicopters only) |
| **Deck Space Utilisation** | High (Simultaneous launch & land) | Moderate (Cross-deck overlap) | High flexibility |
| **Mechanical Complexity** | Very High | Moderate / Low | Low ship complexity / High jet complexity |
| **Representative Aircraft** | F/A-18E/F, Rafale M, F-35C, J-15T | MiG-29K, Su-33, J-15, Rafale M* | F-35B Lightning II, AV-8B Harrier II |
| **Active Carriers** | US Navy (11), France (1), China (1) | India (2), China (2), Russia (1) | US Navy (9 LHDs), UK (2), Italy (2), Japan (2) |

*\*Note: France's Rafale M was originally built for CATOBAR, but extensive shore-based test facility trials in Goa proved that the Rafale M can also operate from Indian Navy STOBAR ski-jumps with operational weapons loads.*

---

## Where India Stands: From Vikrant to IAC-2

The Indian Navy has nearly 65 years of continuous carrier aviation experience—longer than any other Asian navy.

1. **The STOBAR Backbone:** Both **INS Vikramaditya** (44,500 tons) and India's homegrown **INS Vikrant** (45,000 tons, built by Cochin Shipyard) operate on the STOBAR principle. They deploy MiG-29K multi-role fighters, Kamov Ka-31 AEW helicopters, and MH-60R multi-role anti-submarine helicopters.
2. **The Fighter Transition:** To replace ageing airframes and provide modern multi-role capability, the Indian Navy selected the **Dassault Rafale M** for carrier operations, which validated ski-jump takeoffs at INS Hansa in Goa. In parallel, ADA and DRDO are designing the **Twin Engine Deck Based Fighter (TEDBF)** as India's dedicated homegrown naval fighter for the 2030s.
3. **The IAC-2 Decision:** Naval planners are studying requirements for India's third aircraft carrier (IAC-2). While a repeat order of a refined 45,000-ton *Vikrant*-class STOBAR carrier is prioritized for speed of delivery and cost control, future long-term studies evaluate electric-drive CATOBAR with EMALS to enable fixed-wing AEW operations in the wider Indian Ocean Region.

---

## Test Yourself

Click on any question to view the verified answer.

Q: Why can't an E-2D Hawkeye airborne radar plane operate from INS Vikrant or INS Vikramaditya?
A: An E-2D Hawkeye is a heavy twin-turboprop aircraft that lacks the high thrust-to-weight ratio required to accelerate to flying speed on an upward ski-jump under its own engine power alone. It requires an external catapult (CATOBAR) to artificially accelerate it to takeoff speed.

Q: What is a "bolter" during a carrier landing?
A: A bolter occurs when a landing aircraft's tailhook misses all the arrestor wires on the flight deck. Because pilots push their engines to 100% full military power the instant their wheels touch the deck, the aircraft has enough speed and lift to take off again safely and circle around for another attempt.

Q: Why does the UK Royal Navy use STOVL on HMS Queen Elizabeth instead of CATOBAR?
A: When designing the Queen Elizabeth class, the UK chose STOVL with the F-35B to avoid the immense procurement and maintenance costs of steam boilers or early-stage electromagnetic catapults. This allowed the Royal Navy to build two 65,000-ton carriers within budget while deploying 5th-generation stealth fighters.

Q: Does India's ski-jump launch restrict fighter operations?
A: A ski-jump limits the maximum fuel and weapons weight a fighter can lift compared to a catapult launch, particularly in hot tropical weather. Navies overcome this using high-thrust fighters (like the MiG-29K and Rafale M) and post-launch aerial buddy refueling from companion aircraft.

---

*I am a civilian writer and researcher. This explainer relies entirely on publicly released naval engineering documentation, official defence ministry releases, and published aerodynamic studies. No operational deployment coordinates or classified system parameters are discussed.*

## Sources & Official References

- **Indian Navy Official Portal:** Aircraft Carrier Operations, INS Vikrant and INS Vikramaditya Specifications (https://indiannavy.nic.in)
- **Naval Air Systems Command (NAVAIR):** Aircraft Launch and Recovery Equipment (ALRE) Overview — Steam Catapults and EMALS
- **Royal Navy UK:** Queen Elizabeth-class Aircraft Carrier Aviation Systems and F-35B Operations (https://www.royalnavy.mod.uk)
- **US Naval Institute (USNI) Proceedings:** Comparative Analysis of CATOBAR, STOBAR, and STOVL Flight Deck Cycles
- **Aeronautical Development Agency (ADA):** Twin Engine Deck Based Fighter (TEDBF) Carrier Compatibility Studies
- **Journal of Aircraft:** Aerodynamic Principles of Ski-Jump Take-Off for Naval Jet Aircraft
