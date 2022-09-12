#include
"./lib/json2.js";

/*==================== CONFIGURATION, EDIT VALUES HERE ==================== */
var CONFIG = {
  //List of groups/layers that will not be randomized during generation and their visibility will be left in initial state.
  //Examples: static background layers, ground layers, typically static layers present in all pictures.
  ignoredGroups: ["myIgnoredLayer"],
  //Should CSV file with metadata be also generated?
  //Useful for quick analysis of the collection and traits distribution.
  generateCsvFileWithMetadata: true,
  //Can the collection contain duplicates?
  allowDuplicates: false,
  //Paired layers are useful when certain groups and layers relate to each other.
  //If the matching layer is to be visible then a related group name will also be visible.
  //This is useful for example for weather layers - thunderstorm in the background and rain layer in the foreground.
  pairedLayers: [
    {
      matchLayerName: "Example",
      relatedGroupName: "example"
    }
  ],
  //If present prompts will be not shown before NFT generation.
  collectionMetadata: {
    desiredSupply: 10,
    name: null,
    description: null,
    creator: null
  }
};
var logFile;
var loggingEnabled = false; //use this if debugging is needed and then function log(message);
/*==================== DO NOT MODIFY ANYTHING BELOW UNLESS YOU KNOW WHAT YOU ARE DOING ==================== */
function main() {
  var continueConfirmation = confirm(
      "You are about to use the HashLips art generator. Are you sure you want to continue? " +
      "Generation may take a while depending on the collection size. For progress please see " +
      "the build folder."
  );

  var desiredSupply, name, description, creator;

  if (!continueConfirmation) return;

  if (!CONFIG.collectionMetadata || !CONFIG.collectionMetadata.desiredSupply) {
    desiredSupply = prompt("How many images do you want to generate?", "10");
  } else {
    desiredSupply = CONFIG.collectionMetadata.desiredSupply;
  }
  if (!CONFIG.collectionMetadata || !CONFIG.collectionMetadata.name) {
    name = prompt("What is the name of your collection?", "replace me");
  } else {
    name = CONFIG.collectionMetadata.name;
  }
  if (!CONFIG.collectionMetadata || !CONFIG.collectionMetadata.description) {
    description = prompt("What is the description for your collection?", "replace me");
  } else {
    description = CONFIG.collectionMetadata.description;
  }
  if (!CONFIG.collectionMetadata || !CONFIG.collectionMetadata.creator) {
    creator = prompt("Who is the author of the collection?", "replace me");
  } else {
    creator = CONFIG.collectionMetadata.creator;
  }

  if (loggingEnabled === true) {
    logFile = new File(createBuildFolder("build/logs") + "/log.txt");
    logFile.open("w");
    logFile.close();
  }

  var groups = app.activeDocument.layerSets;
  resetLayers(groups);

  //Function for checking existing combinations and avoid duplicates
  var alreadyMintedCombinations = [];

  function isAlreadyMinted(traitCombination) {
    if (CONFIG.allowDuplicates === true) {
      return false;
    }
    for (var i = 0; i < alreadyMintedCombinations.length; i++) {
      if (alreadyMintedCombinations[i] === traitCombination) {
        return true;
      }
    }
    return false;
  }

  var mintedCsvFile = null;

  if (CONFIG.generateCsvFileWithMetadata) {
    mintedCsvFile = new File(createBuildFolder("build/csv") + "/minted-nfts.csv");
    mintedCsvFile.open("w");
    mintedCsvFile.close();
  }

  var groupRarityWeights = [];

  /**
   * Calculates weights for each group and their layers.
   */
  function calculateGroupRarityWeights() {
    var csvHeader = "#,"; //Construct the header for CSV file

    for (var i = 0; i < groups.length; i++) {
      var weighted = {};
      weighted.totalWeight = 0;
      weighted.layerMap = [];
      if (indexOf(CONFIG.ignoredGroups, getCleanLayerName(groups[i].name), null) === -1) {
        csvHeader = csvHeader + groups[i].name + ",";
      }
      for (var j = 0; j < groups[i].layers.length; j++) {
        weighted.totalWeight += getRarityWeight(groups[i].layers[j].name);
        weighted.layerMap.push({
          index: j,
          name: getCleanLayerName(groups[i].layers[j].name),
          weight: getRarityWeight(groups[i].layers[j].name)
        });
      }
      groupRarityWeights.push(weighted);
    }
    csvHeader += "duplicates check"
    if (CONFIG.generateCsvFileWithMetadata === true) {
      appendToFile(mintedCsvFile, csvHeader + "\n");
    }
  }

  calculateGroupRarityWeights();

  while (alreadyMintedCombinations.length < parseInt(desiredSupply)) {
    var metadataObj = {};
    var nftSequenceNumber = alreadyMintedCombinations.length + 1;

    metadataObj.name = name + " #" + parseInt(nftSequenceNumber);
    metadataObj.creator = creator;
    metadataObj.description = description;
    metadataObj.image = "To be replaced";
    metadataObj.type = "image/png";
    metadataObj.format = "opensea";
    metadataObj.attributes = [];

    var generatedProperties = ""; //Stringyfied list of properties generated in this iteration.
    var generatedPropertiesCsv = (nftSequenceNumber) + ",";

    //Iterate through top-level groups of layers
    for (var i = 0; i < groups.length; i++) {
      var totalWeight = 0;
      var layerMap = [];
      //Do not iterate through ignored (fixed) layers.
      if (indexOf(CONFIG.ignoredGroups, getCleanLayerName(groups[i].name)) === -1) {
        totalWeight = groupRarityWeights[i].totalWeight;
        layerMap = groupRarityWeights[i].layerMap;

        var random = Math.floor(Math.random() * totalWeight);

        (function () {
          for (var j = 0; j < groups[i].layers.length; j++) {
            random -= layerMap[j].weight;
            if (random < 0) {
              //Check whether current layer matches any from the paired list.
              var indexOfMatched = indexOf(CONFIG.pairedLayers, getCleanLayerName(groups[i].layers[j].name), "matchLayerName");
              if (indexOfMatched !== -1) {
                //Find the related group index, iterate through group layers and enable all of them.
                var relatedGroupIndex = indexOf(groups, CONFIG.pairedLayers[indexOfMatched].relatedGroupName, getCleanLayerName("name"));

                //Set all layers within group visible
                for (var k = 0; k < groups[relatedGroupIndex].layers.length; k++) {
                  groups[relatedGroupIndex].layers[k].visible = true;
                }
              }

              groups[i].layers[j].visible = true;
              metadataObj.attributes.push({
                trait_type: groups[i].name,
                value: layerMap[j].name
              })
              generatedProperties += groups[i].name + "_" + layerMap[j].name + ":"
              generatedPropertiesCsv += layerMap[j].name + ","
              return;
            }
          }
        })();
      }
    }

    if (isAlreadyMinted(generatedProperties) === false) {
      saveImage(nftSequenceNumber);
      saveMetadata(metadataObj, nftSequenceNumber);
      appendToFile(mintedCsvFile, generatedPropertiesCsv + generatedProperties + "\n");
      alreadyMintedCombinations.push(generatedProperties);
    } else {
      //Do nothing, skip
    }
    resetLayers(groups);
  }

  alert("Generation process is complete.");
}

/**
 * Resets layers into initial state. Function is called before each NFT generation.
 * @param {Array.<LayerSet>} _groups
 */
function resetLayers(_groups) {
  var skippedGroups = [];
  for (var k = 0; k < CONFIG.ignoredGroups.length; k++) {
    log("CONFIG.pairedLayers:" + CONFIG.pairedLayers + "CONFIG.ignoredGroups[k]: " + CONFIG.ignoredGroups[k]);
    if (indexOf(CONFIG.pairedLayers, CONFIG.ignoredGroups[k], "relatedGroupName") === -1) {
      skippedGroups.push(CONFIG.ignoredGroups[k]);
      log("Pushed skipped group:" + CONFIG.ignoredGroups[k]);
    }
  }

  log("resetLayers, ignored groups: " + CONFIG.ignoredGroups);
  log("resetLayers, var skippedGroups: " + skippedGroups.toString());
  for (var i = 0; i < _groups.length; i++) {
    _groups[i].visible = true;

    for (var j = 0; j < _groups[i].layers.length; j++) {
      if (indexOf(skippedGroups, getCleanLayerName(_groups[i].name), null) === -1) {
        _groups[i].layers[j].visible = false;
      }
    }
  }
}

function log(message) {
  if (loggingEnabled === true)
    appendToFile(logFile, "[" + new Date().toString() + "] " + message + "\n");
}

/**
 * Returns layer name stripped of rarity weight
 * @param {string} layerName name of the layer with rarity
 * @returns {string} clean layer name (part before #)
 */
function getCleanLayerName(layerName) {
  return layerName.split("#").shift();
}

/**
 * Saves an image to a file
 * @param {string|number} sequenceNumber NFT sequence number
 */
function saveImage(sequenceNumber) {
  var saveFile = new File(createBuildFolder("build/images") + "/" + sequenceNumber + ".png");
  exportOptions = new ExportOptionsSaveForWeb();
  exportOptions.format = SaveDocumentType.PNG;
  exportOptions.PNG24 = false;
  exportOptions.transparency = true;
  exportOptions.interlaced = false;
  app.activeDocument.exportDocument(
      saveFile,
      ExportType.SAVEFORWEB,
      exportOptions
  );
}

/**
 * Saves metadata of an NFT into .json file
 * @param {object} _data NFT metadata object
 * @param {string|number} sequenceNumber NFT sequence number
 */
function saveMetadata(_data, sequenceNumber) {
  var file = new File(createBuildFolder("build/metadata") + "/" + sequenceNumber + ".json");
  file.open("w");
  file.write(JSON.stringify(_data));
  file.close();
}

/**
 * Appends line of text to a file.
 * @param {File} file
 * @param {string} lineToBeAppended to the file
 */
function appendToFile(file, lineToBeAppended) {
  file.open("a");
  file.write(lineToBeAppended);
  file.close();
}

/**
 * Creates a folder on filesystem.
 * @param {string} _name path
 * @returns {Folder}
 */
function createBuildFolder(_name) {
  var path = app.activeDocument.path;
  var folder = new Folder(path + "/" + _name);
  if (!folder.exists) {
    folder.create();
  }
  return folder;
}

/**
 * Function to check whether an item exists in an array or strings.
 * Cause ECMA-262 (1999) does not have .indexOf function on arrays. :-)
 * @param {Array.<Object>} array array
 * @param lookedUpString string being searched for in the array
 * @param {string} [lookInNestedProperty] match property of a nested object in the array
 * @returns {number} index of the string in array. Returns -1 if not present.
 */
function indexOf(array, lookedUpString, lookInNestedProperty) {
  if (!!lookInNestedProperty) {
    for (var i = 0; i < array.length; i++) {
      if (lookedUpString === array[i][lookInNestedProperty]) {
        return i;
      }
    }
    return -1;
  } else {
    for (var j = 0; j < array.length; j++) {
      if (lookedUpString === array[j]) {
        return j;
      }
    }
    return -1;
  }
}

/**
 * Get weight of the rarity from layer name.
 * @param layerName name of the layer
 * @returns {number} parsed weight of the layer, returns 1 if unset.
 */
function getRarityWeight(layerName) {
  var weight = Number(layerName.split("#").pop());
  if (isNaN(weight)) {
    weight = 1;
  }
  return weight;
}

main();
