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
      if(resettingLayer == "m" && hasMilestone("m",1)) keep.push("upgrades")
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
    if(hasUpgrade("sp",31)) mult = mult.pow(1.015)
    mult = mult.mul(tmp.m.effect)
    return mult
  },
  gainExp() { // Calculate the exponent on main currency from bonuses
    let exponent = new Decimal(1)
    if(hasUpgrade("sp",31)) exponent = exponent.add(0.05)
    return exponent
  },
  directMult() {
    let dmult = new Decimal(1)
    dmult = dmult.mul(buyableEffect("p",11))
    return dmult
  },
  softcap: new Decimal(1e11),
  softcapPower: function() {
    if(hasUpgrade("m",22)) return 0.425
    return 0.4
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
		    hollowCores: new Decimal(0),
		    desolateCores: new Decimal(0)
  }},
  color: "#D52BE8",
  resource: "",
  doReset(resettingLayer) {
    if(layers[resettingLayer].row > layers[this.layer].row) {
      let keep = []
      layerDataReset(this.layer,keep)
      if(resettingLayer == "m" && hasMilestone("m",3)) player.sp.upgrades.push(11,12,13,14,15,21,22,23,24,25)
      if(resettingLayer == "m" && hasMilestone("m",4)) player.sp.upgrades.push(31,32,33,34,35)
      if(resettingLayer == "m" && hasMilestone("m",5)) player.sp.upgrades.push(41,42,43,44,45)
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
            if(getResetGain("f").gte(1e11)) a2 = a2 + "(softcapped)"
            let b = "<br>You have <h2 style='color: #A65E8C; text-shadow: 0 0 10px #A65E8C'>" + format(player.m.points) + "</h3> Memories. "
            let b1 = "(+" + format(getResetGain("m")) + " on reset)"
            if(getResetGain("m").gte(1000)) b1 = b1 + "(softcapped)"
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
          ["display-text",
            function() {
              if(!hasUpgrade("sp",121)) return ""
              let text = "You have <h2 style='color: #244A3F; text-shadow: 0 0 10px #244A3F'>" + format(player.sp.hollowCores) + "</h3> Hollow Cores (<h2 style='color: #244A3F; text-shadow: 0 0 10px #244A3F'>" + format(tmp.sp.hollowCoreGain) + "</h3>/s, starts at 5.00e14 Fragments)."
              return text
            },
            {"color": "#ffffff", "font-size": "14px"}
          ],
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
        body: "This is the first Main Story song pack.<br>Released in version 1.0.8, It contains 9 songs in total (one of them was actually added later in version 1.9.3), and requires 500 Memories to unlock."
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
      description: "Multiplies Fragment gain base on the Chart Upgrades you've bought.",
      cost: new Decimal(3000),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      effect() {
        let base = new Decimal(1.06)
        if(hasUpgrade(this.layer,41)) base = base.add(0.04)
        return base.pow(player.sp.upgrades.length)
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
      description: "Raise Fragment gain to the 1.015th power.",
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
      effect() {return player.f.points.pow(1/3).div(4500).add(1).log10().add(1)},
      effectDisplay() {return "x" + format(upgradeEffect(this.layer,this.id))},
      unlocked() {return hasUpgrade(this.layer,43)}
    },
    45: {
      title: "Oblivia PRS 5",
      description: "Multiply point gain base on the Chart Upgrades you've bought.",
      cost: new Decimal(6e12),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      effect() {
        let base = new Decimal(1.2)
        return base.pow(player.sp.upgrades.length)
      },
      effectDisplay() {return "x" + format(upgradeEffect(this.layer,this.id))},
      unlocked() {return hasUpgrade(this.layer,44)}
    },
    111: {
      title: "cry of viyella PST 3",
      description: "Multiply Memory gain base on Memories.",
      cost: new Decimal(3e12),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      effect() {
        let division = 70
        if(hasUpgrade(this.layer,113)) division = 50
        return player.m.points.pow(0.5).div(division).add(1).log10().add(1)
      },
      effectDisplay() {return "x" + format(upgradeEffect(this.layer,this.id))},
      unlocked() {return getBuyableAmount("m",11).gte(1)}
    },
    112: {
      title: "Essence of Twilight PST 4",
      description: "Unlock Partners.",
      cost: new Decimal(1e13),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      onPurchase() {player.p.unlocked = true},
      unlocked() {return hasUpgrade(this.layer,111)}
    },
    113: {
      title: "PRAGMATISM PST 4",
      description: "Slightly improve the effect formula of \"cry of viyella PST 3\".",
      cost: new Decimal(1e14),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,112)}
    },
    114: {
      title: "Sheriruth PST 5",
      description: "Increase Hikari's effect base by 0.15.",
      cost: new Decimal(5e14),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,113)}
    },
    121: {
      title: "memoryfactory.lzh PRS 5",
      description: "Unlock Hollow Core.",
      cost: new Decimal(1e15),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,114)}
    },
    122: {
      title: "I've heard it said PRS 6",
      description: "Multiply point gain base on Hollow Cores.",
      cost: new Decimal(3),
      currencyDisplayName: "Hollow Cores",
      currencyInternalName: "hollowCores",
      currencyLayer: "sp",
      effect() {return player.sp.hollowCores.mul(5).add(1)},
      effectDisplay() {return "x" + format(upgradeEffect(this.layer,this.id))},
      unlocked() {return hasUpgrade(this.layer,121)}
    },
    123: {
      title: "Relentless PRS 6",
      description: "Double Hollow Core gain.",
      cost: new Decimal(5),
      currencyDisplayName: "Hollow Cores",
      currencyInternalName: "hollowCores",
      currencyLayer: "sp",
      unlocked() {return hasUpgrade(this.layer,122)}
    },
    124: {
      title: "Lumia PRS 5",
      description: "Slow down Hikari's upgrading cost scale.<br>(Current endgame)",
      cost: new Decimal(2e16),
      currencyDisplayName: "Fragments",
      currencyInternalName: "points",
      currencyLayer: "f",
      unlocked() {return hasUpgrade(this.layer,123)}
    }
  },
  hollowCoreGain() {
    if(player.f.points.lte(5e14)) return new Decimal(0)
    let gain = player.f.points.div(5e14).log10().div(10)
    if(hasUpgrade("sp",123)) gain = gain.mul(2)
    return gain 
  },
  update(diff) {
    if(hasUpgrade(this.layer,121)) player.sp.hollowCores = tmp.sp.hollowCoreGain.mul(diff).add(player.sp.hollowCores)
  },
  layerShown() {return hasUpgrade("f",13) || player.m.unlocked}
})


addLayer("p", {
  name: "partner",
  symbol: "P",
  row: 0,
  position: 2,
  tooltip() {return "Partners"},
  startData() {return {
    unlocked: false,
    points: new Decimal(0)
  }},
  color: "#29EB9D",
  resource: "",
  doReset(resettingLayer) {
    layerDataReset(this.layer,[buyables])
  },
  tabFormat: {
    "Partners": {
      content: [
        ["display-text",
          function() {
            let a = "You have <h2 style='color: #3CD3E3; text-shadow: 0 0 10px #3CD3E3'>" + format(player.f.points) + "</h3> Fragments. "
            let a1 = "(+" + format(getResetGain("f")) + " on reset)"
            let a2 = "(+" + format(getResetGain("f").mul(0.1)) + "/s)"
            if(getResetGain("f").gte(1e11)) a2 = a2 + "(softcapped)"
            let b = "<br>You have <h2 style='color: #A65E8C; text-shadow: 0 0 10px #A65E8C'>" + format(player.m.points) + "</h3> Memories. "
            let b1 = "(+" + format(getResetGain("m")) + " on reset)"
            if(getResetGain("m").gte(1000)) b1 = b1 + "(softcapped)"
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
        "blank",
        ["display-text","These buyables will be kept on Memory reset."],
        "buyables"
      ]
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
  infoboxes: {
    1: {
      title: "Partners",
      body: "These buyables are named after the partners in Arcaea.<br>Each buyable has its own effect and amount limit (which equals to the level cap of the partner in the real game).<br>You'll unlock more partners (buyables) as you continue to play."
    }
  },
  buyables: {
    11: {
      title() {return "Hikari Lv." + getBuyableAmount(this.layer,this.id) + "/" + this.purchaseLimit()},
      display() {
        let base = 1.5
        if(hasUpgrade("sp",114)) base = base + 0.15
        return "<br>Multiplying your Fragment gain by " + base + " per level, after softcap.<br>Current effect: x" + format(this.effect()) + "<br>Upgrading will cost " + format(this.cost()) + " Fragments."
      },
      cost(x) {
        let scaler = 1
        if(hasUpgrade("sp",124)) scaler = 0.9
        return x.add(1).pow(x.mul(scaler).sub(scaler).add(2)).mul(1e13)
      },
      purchaseLimit() {return 20},
      effect(x) {
        let base = new Decimal(1.5)
        if(hasUpgrade("sp",114)) base = base.add(0.15)
        return base.pow(x)
      },
      canAfford() {return player.f.points.gte(this.cost())},
      buy() {
        player.f.points = player.f.points.sub(this.cost())
        setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1))
      }
    },
    12: {
      title() {return "Tairitsu Lv." + getBuyableAmount(this.layer,this.id) + "/" + this.purchaseLimit()},
      display() {return "<br>Multiplying your Memory gain by " + "1.5" + " per level, before softcap.<br>Current effect: x" + format(this.effect()) + "<br>Upgrading will cost " + format(this.cost()) + " Memories."},
      cost(x) {
        return x.add(1).pow(2).mul(1500)
      },
      purchaseLimit() {return 20},
      effect(x) {return new Decimal(1.5).pow(x)},
      canAfford() {return player.m.points.gte(this.cost())},
      buy() {
        player.m.points = player.m.points.sub(this.cost())
        setBuyableAmount(this.layer,this.id,getBuyableAmount(this.layer,this.id).add(1))
      }
    }
  },
  layerShown() {return player.p.unlocked}
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
    if(hasUpgrade("sp",44)) mult = mult.mul(upgradeEffect("sp",44))
    if(hasUpgrade("sp",111)) mult = mult.mul(upgradeEffect("sp",111))
    if(hasUpgrade("m",23)) mult = mult.mul(1.5)
    mult = mult.mul(buyableEffect("p",12))
    return mult
  },
  gainExp() {return new Decimal(1)},
  effect() {
    if(player.m.points.lte(100000)) return player.m.points.add(1).pow(1.1397931)
    return player.m.points.add(1).pow(player.m.points.log10().mul(0.2279586))},
  effectDescription() {
    let a = "multiplying Fragment gain by "
    if(hasUpgrade("m",11)) a = "multiplying point and Fragment gain by "
    return a + format(tmp.m.effect) + ". This applys after all the upgrades, challenges and buyables in the previous layers, before Fragment gain softcap."
  },
  softcap: new Decimal(1000),
  softcapPower: 0.3,
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
        ["upgrades",[1]],
        "blank",
        ["upgrades",[2]]
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
      effectDescription: "Keep the 1st-10th Chart Upgrades in \"Arcaea\" on reset.",
      done() {return player.m.points.gte(20)}
    },
    4: {
      requirementDescription: "200 Memories",
      effectDescription: "Keep the 11st-15th Chart Upgrades in \"Arcaea\" on reset.",
      done() {return player.m.points.gte(200)}
    },
    5: {
      requirementDescription: "10,000 Memories",
      effectDescription: "Keep the 16th-20th Chart Upgrades in \"Arcaea\" on reset.",
      done() {return player.m.points.gte(10000)}
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
    },
    21: {
      title: "Point Booster",
      description: "Raise point gain base on Fragments and points. (This upgrade will keep unlocked on Memory reset.)",
      cost: new Decimal(400),
      effect() {return player.f.points.mul(player.points).add(1).log10().mul(0.002).add(1)},
      effectDisplay() {return "^" + format(upgradeEffect(this.layer,this.id),4)},
      unlocked() {return hasUpgrade(this.layer,12)}
    },
    22: {
      title: "What? Softcap?",
      description: "Slightly weaken the effect of Fragment gain softcap.",
      cost: new Decimal(1000),
      unlocked() {return hasUpgrade(this.layer,21)}
    },
    23: {
      title: "Giving Out Money",
      description: "Give lowiro 100￡, making you gain 1.5x more Memories. (before softcap)",
      cost: new Decimal(5000),
      unlocked() {return hasUpgrade(this.layer,22)}
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
      tooltip: "Get 29,997 Fragments.<br>(In the real game, your Fragments are capped at 29,997.)",
      done() {return player.f.points.gte(29997)}
    },
    13: {
      name: "That Costs About 2￡",
      tooltip: "Get 100 Memories.",
      done() {return player.m.points.gte(100)}
    },
    14: {
      name: "I'm Going to Buy All the Songs",
      tooltip: "Get 32900 Memories.<br>(In version 6.2.0, all the songs and song packs cost 32,900 Memories in total.)",
      done() {return player.m.points.gte(32900)}
    }
  },
  layerShown() {return true}
})