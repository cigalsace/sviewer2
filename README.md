# sviewer2
Evolution du sviewer de geOrchestra pour le rendre plus modulable

A ce stade, il s'agit principalement d'une démarche expooiratoire.
L'ensemble des fonctionnalités du sviewer original (cf. https://github.com/georchestra/sviewer) ne sont pas reprises et les modules ne sont pas pleinement fonctionnels.

Les travaux réalisés portent sur:

* le CSS pour perttre l'utilisation directe des thèmes de jquery mobile directement (cf. lib/jquerymobile/themes).
* le chargement de certaines fonctionnalités sous forme de modules
* l'optimisation d'une partie du code (IIFE, reprise de certaines fonctions, etc.)


## Démo: 

sviewer par défaut (modules locateBox, queryBox, parametersBox): http://cigalsace.net/sviewer2/2.09/index.html?layers=ARAA:ARAA_BDSols-Alsace_250000_SHP_L93

désactivation des modules locateBox et queryBox:
http://cigalsace.net/sviewer2/2.09/index.html?layers=ARAA:ARAA_BDSols-Alsace_250000_SHP_L93&delPlugins=locateBox,queryBox

A noter que le module legendBox n'est actif que si un layer est précisé:
http://cigalsace.net/sviewer2/2.09/index.html?delPlugins=locateBox,queryBox
