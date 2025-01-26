addLayer("f", {
  name: "fragment", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "F", // This appears on the layer's node. Default is the id with the first letter capitalized
  row: 0, // Row the layer is in on the tree (0 is the first row)
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {return {
    unlocked: true,
	  points: new Decimal(0),
  }},
  color: "#3CD3E3",
  requires() {
    let base = new Decimal(10)
    if(hasUpgrade("sp",23)) base = base.sub(1)
    return base
  }, // Can be a function that takes requirement increases into account
  resource: "Fragments", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() {return player.points}, // Get the current amount of baseResource
  exponent: 0.5, // Prestige currency exponent
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  doReset(resettingLayer) {
    if(layers[resettingLayer].row > layers[this.layer].row) {
      let keep = []
      if(resettingLayer == "m" && hasMilestone("m",1)) {keep.push("upgrades")}
      layerDataReset(this.layer,keep)
    }
  },
  passiveGeneration() {
    if(hasMilestone("m",2)) return 0.1
    return 0
  },
  gainMult() { // Calculate the multiplier for main currency from bonuses
    let mult = new Decimal(1)
    if(hasUpgrade("sp",11)) mult = mult.mul(1.5)
    if(hasUpgrade("sp",13)) mult = mult.mul(upgradeEffect("sp",13))
    if(hasUpgrade("sp",14)) mult = mult.mul(upgradeEffect("sp",14))
    if(hasUpgrade("sp",24)) mult = mult.mul(upgradeEffect("sp",24))
    mult = mult.mul(tmp.m.effect)
    return mult
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    let exponent = new Decimal(1)
    if(hasUpgrade("sp",31)) exponent = exponent.add(0.05)
    return exponent
  },
  tabFormat: {
    "Main": {
      content: [
        "main-display",
        "prestige-button",
        ["display-text",
          function() {return "You have " + format(player.points) + " points"},
          {"color": "#ffffff", "font-size": "14px"}
        ],
        "blank",
        "blank",
        "blank",
        "upgrades"
      ]
    },
  },
  upgrades: {
    11: {
      title: "Download Arcaea",
      description: "Double point gain.",
      cost: new Decimal(1)
    },
    12: {
      title: "Watching the Tutorial",
      description: "Double point gain, again.",
      cost: new Decimal(2),
      unlocked() {return hasUpgrade(this.layer,11) || player.m.unlocked}
    },
    13: {
      title: "\"Welcome to Arcaea!\"",
      description: "Multiply point gain based on points. Unlock Song Packs.",
      cost: new Decimal(5),
      unlocked() {return hasUpgrade(this.layer,12) || player.m.unlocked},
      effect() {return player.points.mul(2).add(4).log10().add(0.39794)},
      effectDisplay() {return "x" + format(upgradeEffect(this.layer,this.id))}
    },
  },
  hotkeys: [{
    key: "f",
    description: "F: Reset for Fragments",
    onPress() {if(canReset(this.layer)) doReset(this.layer)}
    }],
  layerShown() {return true}
})

addLayer("sp", {
  name: "song_pack",
  symbol: "SP",
  row: 0,
  position: 1,
  tooltip() {return "Song Packs"},
  startData() {return {
        unlocked: true,
		    points: new Decimal(0),
  }},
  color: "#D52BE8",
  resource: "Song Packs",
  doReset(resettingLayer) {
    if(layers[resettingLayer].row > layers[this.layer].row) {
      layerDataReset(this.layer,[])
      if(resettingLayer == "m" && hasMilestone("m",3)) player.sp.upgrades = player.sp.upgrades.concat([11,12,13,14,15,21,22,23,24,25])
      if(resettingLayer == "m" && hasMilestone("m",4)) player.sp.upgrades = player.sp.upgrades.concat([31,32,33,34,35])
    }
  },
  tabFormat: {
    "Upgrades": {
      content: [
        ["display-text",
          function() {
            let a = "You have <h2 style='color: #3CD3E3; text-shadow: 0 0 10px #3CD3E3'>" + format(player.f.points) + "</h3> Fragments. "
            let a1 = "(+" + format(getResetGain("f")) + " on reset)"
            let a2 = "(+" + format(getResetGain("f").mul(0.1)) + "/s)"
            let b = "<br>You have <h2 style='color: #A65E8C; text-shadow: 0 0 10px #A65E8C'>" + format(player.m.points) + "</h3> Memories. "
            let b1 = "(+" + format(getResetGain("m")) + " on reset)"
            if(!player.m.unlocked) return a + a1
            if(player.m.unlocked && !hasMilestone("m",2)) return a + a1 + b + b1
            if(player.m.unlocked && hasMilestone("m",2)) return a + a2 + b + b1
          },
          {"color": "#ffffff", "font-size": "14px"}
        ],
        "blank",
        "clickables",
        "blank",
        ["infobox",1],
        ["microtabs","Upgrades"]
      ]
    },
  },
  microtabs: {
    Upgrades: {
      "Arcaea": {
        content: [
          ["infobox",2],
          ["upgrades",[1,2,3]],
          "blank",
          ["upgrades",[4,5,6]],
          "blank",
          ["upgrades",[7,8,9]]
        ]
      },
      "Eternal Core": {
        content: [
          ["infobox",3],
          ["upgrades",[11,12]]
        ],
        unlocked() {return getBuyableAmount("m",11).gte(1)}
      },
    }
  },
  clickables: {
    11: {
      display() {return "Reset your points for Fragments"},
      canClick() {return canReset("f")},
      onClick() {doReset("f")},
      unlocked() {return !hasMilestone("m",2)}
    },
    12: {
      display() {return "Reset your Fragments for Memories"},
      canClick() {return canReset("m")},
      onClick() {doReset("m")},
      unlocked() {return player.m.unlocked}
    }
  },
  infoboxes:{
      1: {
        title: "Chart Upgrades",
        body: "These upgrades are named after the charts in Arcaea.<br>PST represents Past, which is the easiest class of the charts. PRS represents Present, which is harder. And FTR represents Future, which is even harder.<br>You won't see Eternal or Beyond charts here. They will appear later as challenges."
      },
      2: {
        title: "Arcaea",
        body: "This is the free song pack in the game. You know, you have to pay for almost every song pack in the game -- except for this.<br>This song pack actually contains 60 songs, and I'll not put them all in this tab. I'll only choose 15 pieces of each of the three classes of charts."
      },
      3: {
        title: "Eternal Core",
        body: "This is the first Main Story song pack.<br>It contains 9 songs in total, and requires 500 Memories to unlock."
      }
  },
  upgrades: {
    11: {
      title: "Fairytale PST 1",
      description: "Multiply Fragment gain by 1.5.",
      cost: new Decimal(10),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f"
    },
    12: {
      title: "Sayonara Hatsukoi PST 1",
      description: "Multiply point gain based on Fragments.",
      cost: new Decimal(15),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,11) || player.m.unlocked},
      effect() {
        let exponent = 1/3
        if(hasUpgrade(this.layer,34)) exponent = 5/14
        return player.f.points.max(1).sub(1).div(3).pow(exponent).add(1)
      },
      effectDisplay() {return "x" + format(upgradeEffect(this.layer,this.id))}
    },
    13: {
      title: "Infinity Heaven PST 1",
      description: "Multiply Fragment gain based on Fragments.",
      cost: new Decimal(30),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,12) || player.m.unlocked},
      effect() {
        let multiplier = 0.4
        if(hasUpgrade(this.layer,35)) multiplier = 1
        return player.f.points.add(1).log10().mul(multiplier).add(1)
      },
      effectDisplay() {return "x" + format(upgradeEffect(this.layer,this.id))}
    },
    14: {
      title: "Brand new world PST 2",
      description: "Multiply Fragment gain based on points.",
      cost: new Decimal(50),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,13) || player.m.unlocked},
      effect() {
        let division = 5
        if(hasUpgrade(this.layer,21)) division = 3
        return player.points.add(1).log10().div(division).add(1)
      },
      effectDisplay() {return "x" + format(upgradeEffect(this.layer,this.id))}
    },
    15: {
      title: "Snow White PST 2",
      description: "Raise point gain to the 1.25th power.",
      cost: new Decimal(125),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,14) || player.m.unlocked}
    },
    21: {
      title: "Vexaria PST 2",
      description: "Slightly improve the effect formula of \"Brand new world PST 2\".",
      cost: new Decimal(300),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,15) || player.m.unlocked}
    },
    22: {
      title: "inkar-usi PST 2",
      description: "Multiply point gain by 4.",
      cost: new Decimal(450),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,21) || player.m.unlocked}
    },
    23: {
      title: "Suomi PST 2",
      description: "Reduce Fragment cost base by 1.",
      cost: new Decimal(1000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,22) || player.m.unlocked}
    },
    24: {
      title: "Babaroque PST 3",
      description: "Multiplies Fragment gain base on the upgrades you've bought in this song pack.",
      cost: new Decimal(3000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      effect() {
        let base = new Decimal(1.06)
        let count = 0
        if(hasUpgrade(this.layer,41)) base = base.add(0.04)
        for(let i in player.sp.upgrades) if(parseInt(i) < 110) count++
        return base.pow(count)
      },
      effectDisplay() {return "x" + format(upgradeEffect(this.layer,this.id))},
      unlocked() {return hasUpgrade(this.layer,23) || player.m.unlocked}
    },
    25: {
      title: "Reinvent PST 2",
      description: "Multiply point gain by 5. Unlock Memories.",
      cost: new Decimal(10000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,24) || player.m.unlocked}
    },
    31: {
      title: "SUPERNOVA PST 3",
      description: "Raise Fragment gain to the 1.05th power.",
      cost: new Decimal(50000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return (hasUpgrade(this.layer,25) && player.m.unlocked) || hasUpgrade("m",11)}
    },
    32: {
      title: "world.execute(me) PST 3",
      description: "Raise point gain to the 1.1th power.",
      cost: new Decimal(1000000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,31) || hasUpgrade("m",11)}
    },
    33: {
      title: "DDD PST 2",
      description: "Reduce Memory cost base by 9997.",
      cost: new Decimal(8000000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,32) || hasUpgrade("m",11)}
    },
    34: {
      title: "Lost Civilization PST 4",
      description: "Slightly improve the effect formula of \"Sayonara Hatsukoi PST 1\".",
      cost: new Decimal(30000000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,33) || hasUpgrade("m",11)}
    },
    35: {
      title: "qualia -ideaesthesia- PST 4",
      description: "Slightly improve the effect formula of \"Infinity Heaven PST 1\".",
      cost: new Decimal(100000000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,34) || hasUpgrade("m",11)}
    },
    41: {
      title: "Sayonara Hatsukoi PRS 4",
      description: "Increase the effect base of \"Babaroque PST 3\" by 0.04.",
      cost: new Decimal(250000000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,35) && hasUpgrade("m",11)}
    },
    42: {
      title: "Rise PRS 4",
      description: "Increase Memory gain exponent by 0.04.",
      cost: new Decimal(1e9),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,41)}
    },
    43: {
      title: "Kanagawa Cyber Culvert PRS 5",
      description: "Multiply Memory gain base on points.",
      cost: new Decimal(1e10),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      effect() {return player.points.div(1e11).add(1).log10().div(2.8).add(1)},
      effectDisplay() {return "x" + format(upgradeEffect(this.layer,this.id))},
      unlocked() {return hasUpgrade(this.layer,42)}
    },
    44: {
      title: "Lucifer PRS 5",
      description: "Multiply Memory gain base on Fragments.",
      cost: new Decimal(1e11),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      effect() {return player.points.pow(1/3).div(4500).add(1).log10().add(1)},
      effectDisplay() {return "x" + format(upgradeEffect(this.layer,this.id))},
      unlocked() {return hasUpgrade(this.layer,43)}
    },
    111: {
      title: "cry of viyella PST 3",
      description: "Multiply point gain base on the upgrades you've bought in this song pack.<br>(Current Endgame)",
      cost: new Decimal(2e11),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      effect() {
        let base = new Decimal(1.5)
        let count = 0
        for(let i in player.sp.upgrades) if(parseInt(i) > 110 && parseInt(i) < 210) count++
        return base.pow(count)
      },
      effectDisplay() {return "x" + format(upgradeEffect(this.layer,this.id))}
    }
  },
  layerShown() {return hasUpgrade("f",13) || player.m.unlocked}
})


addLayer("m", {
  name: "memory",
  symbol: "M",
  row: 1,
  position: 0,
  startData() {return {
    unlocked: false,
    points: new Decimal(0)
  }},
  color: "#A65E8C",
  requires() {
    let base = new Decimal(29997)
    if(hasUpgrade("sp",33)) base = base.sub(9997)
    return base
  },
  resource: "Memories",
  baseResource: "Fragments",
  baseAmount() {return player.f.points},
  type: "normal",
  exponent() {
    let exponent = 0.18
    if(hasUpgrade("sp",42)) exponent = 0.22
    return exponent
  },
  gainMult() {
    let mult = new Decimal(1)
    if(hasUpgrade("sp",43)) mult = mult.mul(upgradeEffect("sp",43))
    return mult
  },
  gainExp() {return new Decimal(1)},
  effect() {
    if(player.m.points.lte(100000)) return player.m.points.add(1).pow(1.1397931)
    return player.m.points.add(1).pow(player.m.points.log10().mul(0.2279586))},
  effectDescription() {
    if(hasUpgrade("m",11)) return "multiplying point and Fragment gain by " + format(tmp.m.effect)
    return "multiplying Fragment gain by " + format(tmp.m.effect)
  },
  tabFormat: {
    "Main": {
      content: [
        "main-display",
        "prestige-button",
        ["display-text",
          function() {return "You have " + format(player.f.points) + " Fragments"},
          {"color": "#ffffff", "font-size": "14px"}
        ],
        "blank",
        "blank",
        "blank",
        "upgrades"
      ]
    },
    "Buyables": {
      content: [
        "main-display",
        "prestige-button",
        ["display-text",
          function() {return "You have " + format(player.f.points) + " Fragments"},
          {"color": "#ffffff", "font-size": "14px"}
        ],
        "blank",
        "blank",
        "blank",
        "buyables"
      ],
      unlocked() {return hasUpgrade("m",12)}
    },
    "Milestones": {
      content: [
        "main-display",
        "prestige-button",
        ["display-text",
          function() {return "You have " + format(player.f.points) + " Fragments"},
          {"color": "#ffffff", "font-size": "14px"}
        ],
        "blank",
        "blank",
        "blank",
        "milestones"
      ]
    }
  },
  milestones: {
    1: {
      requirementDescription: "2 Memories",
      effectDescription: "Keep the 3 upgrades in Fragments (NOT the Chart Upgrades) on reset. Unlock new Chart Upgrades.",
      done() {return player.m.points.gte(2)}
    },
    2: {
      requirementDescription: "10 Memories",
      effectDescription: "Automatically generate 10% of Fragments gained on reset every second.",
      done() {return player.m.points.gte(10)}
    },
    3: {
      requirementDescription: "20 Memories",
      effectDescription: "Keep the 1st-10th Chart Upgrades on reset.",
      done() {return player.m.points.gte(20)}
    },
    4: {
      requirementDescription: "200 Memories",
      effectDescription: "Keep the 11st-15th Chart Upgrades on reset.",
      done() {return player.m.points.gte(200)}
    }
  },
  upgrades: {
    11: {
      title: "So You Decided to Purchase Memories?",
      description: "(Require 40 Memories)<br>The effect of Memories also applies on points (after the Chart Upgrades). Unlock new Chart Upgrades.",
      cost: new Decimal(30),
      canAfford() {return player.m.points.gte(40)},
      unlocked() {return player.m.unlocked}
    },
    12: {
      title: "I Can Finally Buy More Song Packs!",
      description: "Unlock some buyables. (You'll soon unlock more Song Packs.)",
      cost: new Decimal(500),
      unlocked() {return hasUpgrade(this.layer,11)}
    }
  },
  buyables: {
    11: {
      title: "More Song Packs",
      display() {return "Unlock a new Song Pack containing new Chart Upgrades and Challenges.<br>Effect: +" + format(getBuyableAmount(this.layer,this.id)) + " new Song Packs<br>Cost: " + format(this.cost()) + " Memories"},
      cost(x) {
        if(x.eq(0)) return new Decimal(0)
        return new Decimal(Infinity)
      },
      canAfford() {return player[this.layer].points.gte(this.cost())},
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost())
        setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer, this.id).add(1))
      }
    }
  },
  hotkeys: [{
    key: "m",
    description: "M: Reset for Memories",
    onPress() {if(canReset(this.layer)) doReset(this.layer)}
    }],
  layerShown() {return hasUpgrade("sp",24) || player.m.unlocked}
})


addLayer("ac", {
  name: "achievement",
  symbol: "Ac",
  row: "side",
  tooltip() {return "Achievements"},
  startData() {return {
      unlocked: true,
	    points: new Decimal(0),
  }},
  color: "#FFFF00",
  resource: "Achievement Points",
  tabFormat: {
    "Achievements": {
      content: ["achievements"]
    }
  },
  achievements: {
    11: {
      name: "The Origin",
      tooltip: "Get your first Fragment.",
      done() {return player.f.points.gte(1)}
    },
    12: {
      name: "My Fragments are Full!",
      tooltip: "Get 29997 Fragments.<br>(In the real game, your Fragments are capped at 29997.)",
      done() {return player.f.points.gte(29997)}
    },
    13: {
      name: "That Costs About 2￡",
      tooltip: "Get 100 Memories.",
      done() {return player.m.points.gte(100)}
    }
  },
  layerShown() {return true}
})