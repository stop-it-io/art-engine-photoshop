# NFT art engine for Photoshop
Originally forked from [HashLips](hashlips_art_engine_ps_script) where all credit is due for the original source code.

Curated for [Hedera](https://hedera.com) network by [Stop-It.io](https://stop-it.io)

This script allows you to generate art works right from Photoshop. 
It has been heavily modified for needs of our own collections.

**Major changes derived from the original script**:
- changes to metadata structure to be compliant with Hedera HIP-412,
- made generation script more efficient in general,
- added documentation and comments for the script internals,
- added additional configuration options:
  - ability to define whether duplicates are allowed,
  - ability to ignore photoshop layers while generating and randomizing,
  - ability to generate a CSV file with metadata,
  - ability to suppress most of the prompts when generating using configuration.

## Configuration options
Configuration options can be changed in `generate.js` script, top section.
- `ignoredLayers`: (string[])
  - List of layers that will not be randomized during generation and their visibility will be left in initial state before starting the generation process.
  - Note<sup>1</sup>: These must be exactly the same as name of the "group/layer" in Photoshop.
  - Note<sup>2</sup>: Only top-level groups/layers are considered. Anything nested in groups is ignored and the script does not support it.
- `generateCsvFileWithMetadata`: (boolean)
  - Should CSV file with metadata be also generated? Useful for quick analysis of the collection and calculating trait distribution or checking for duplicates. File will be output to build folder.
- `allowDuplicates`: (boolean)
  - Can the collection contain duplicates? Be aware, in large collections and/or with collections with low number of possible trait combinations this may severely impact time needed to generate the collection.
- `pairedLayers`: (object[])
  - Paired layers are useful when certain groups and layers relate to each other. If the matching layer is to be visible then a related group name will also be visible. This is useful for example for weather layers - thunderstorm in the background and rain layer in the foreground.
    - `matchLayerName`: (string)
      - When generated layer matches then make "relatedGroupName" also visible.
    - `relatedGroupName`: (string)
      - Name of the related group to be made visible. Note only top-level groups are supported. All nested layers within group will be made visible.
- `collectionMetadata`:
  - `desiredSupply`: (number)
    - Number of many NFTs will be generated.
    - If present prompt for supply is suppressed.
  - `name`: (string)
    - Common name for all the NFTs. Note script automatically appends sequence number  `#<number>`.
    - *Example*: "My NFT" results in: "My NFT #1"
    - If present prompt for supply is suppressed.
  - `description`: (string)
    - Description, common for all the NFTs.
    - If present prompt for supply is suppressed.
  - `creator`: (string)
    - Common creator for all the NFTs.
    - If present prompt for supply is suppressed.

## Rarity settings
Same as the original from HashLips the script supports adding rarity weights of individual traits.
For more info please see this video tutorial directly from HashLips: https://www.youtube.com/watch?v=YAexk-Qjtt0

Weights to individual layers can be added when `#<number>` is appended to layer name. E.g.: "Pink hat#10".
When weight is not specified for layer, "1" is assumed.

## Final notes
### Estimating time needed
The script does not calculate time estimations. In case of large collections, generating may take significant amounts of time.
Photoshop will appear frozen/not responding during the generation process. You can keep track of the progress in the build folder.
To estimate time needed, we suggest generate a smaller sample and see how much time the sample takes. Based on that an estimation can be made.
Please be aware that due to the nature of how duplicates are determined, generation process will gradually slow down as probability of generating non-unique combination raises.

Impacting factors are:
 - computing power of the computer and disk speed,
 - whether duplicates are allowed,
 - size of the picture and number of groups and layers,
 - number of possible trait combinations.

### Metadata format
Stop-It.io operates on [Hedera](https://hedera.com) network. The metadata format is according to the specification of the Hedera network, however it may be usable for other networks as well.
See also:
 - https://hips.hedera.com/hip/hip-412

### Editing the script
- When making any changes to the script please be aware that Photoshop uses archaic [ECMA 262 (1999)](https://www.ecma-international.org/wp-content/uploads/ECMA-262_3rd_edition_december_1999.pdf) and many modern functions are not available.
- Good documentation on Photoshop scripting API is available here: https://theiviaxx.github.io/photoshop-docs/Photoshop/index.html
- When editing the script debugging functionality is provided using a log function. Set variable `loggingEnabled` to `true` and then use `log("your message");` at your discretion in the code. A log file will be created in the build folder.

## Disclaimer
Use absolutely only at your own risk. We strive to provide Hedera community with tools we develop, however everything we provide is "AS-IS".

There are inherent dangers in the use of any software available for download on the Internet, and we caution you to make sure that you completely understand the potential risks before downloading any of the software.

The Software and code samples available on this website are provided "**AS-IS**" without warranty of any kind, either express or implied. Use at your own risk.

The use of the software and scripts downloaded on this site is done at your own discretion and risk and with agreement that you will be solely responsible for any damage to your computer system or loss of data that results from such activities. You are solely responsible for adequate protection and backup of the data and equipment used in connection with any of the software, and we will not be liable for any damages that you may suffer in connection with using, modifying or distributing any of this software. No advice or information, whether oral or written, obtained by you from us or from this website shall create any warranty for the software.

We make no warranty that:
- The software will meet your requirements.
- The software will be uninterrupted, timely, secure or error-free.
- The results that may be obtained from the use of the software will be effective, accurate or reliable.
- The quality of the software will meet your expectations.
- Any errors in the software obtained from us will be corrected.