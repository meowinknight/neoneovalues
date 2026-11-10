/* NeoNeoValues additions.
   Everything that is NOT in the original NeoValues data lives here, so data.js stays exactly as it was.
   Load this file right after data.js. It only ADDS entries; it never changes or removes original ones.

   To add an easter egg ideology: add an object to EASTER_EGGS.
   - keys: one or more "|"-joined sets of value ids (every id must be matched). Use more than one key
           for variants. Longer keys win over shorter ones, so a long key makes the egg rare.
   - color: label colour (any CSS colour); description: the text shown on its page. */
(function () {
    // If data.js did not load completely there is nothing to add to; stay quiet and let the page report it.
    if (typeof labelMapping === 'undefined' || typeof labelColors === 'undefined' ||
        typeof descriptions === 'undefined' || typeof ideologyGroups === 'undefined') {
        if (window.console) console.warn('mods.js: data.js did not load completely, skipping the extra ideologies');
        return;
    }
    const EASTER_EGG_GROUP = "Easter Eggs";

    const EASTER_EGGS = [
        {
            name: "Fully Automated Luxury Gay Space Communism",
            color: "#9b2f8fff",
            description: "A tongue-in-cheek, internet-born vision of a post-scarcity future. Automation and abundant energy abolish scarcity, wages and money, so goods are shared freely and the state withers into free communes. Everyone is at liberty to live and love as they please, and humanity spreads out among the stars. Originally a meme, it now doubles as shorthand for radically optimistic, technology-driven left politics.",
            keys: [
                "communization|collective_distribution|postmodernism|anarchism|Cosmopolitanism|Internationalism|prometheanism|permissivism|municipalism",
                "communization|collective_distribution|postmodernism|anarchism|Cosmopolitanism|Internationalism|extropianism|permissivism|municipalism"
            ]
        },
        {
            name: "Anarcho-Cottagecore",
            color: "#6b8f5aff",
            description: "A gentle, rural-aesthetic vision of stateless life: small self-governing communes, shared land, home-grown food, craft skills and mutual aid, with a strong preference for staying home. It mixes anarchist organization with a nostalgic, softly traditional taste for the countryside, and no one is forced to live any particular way.",
            keys: [
                "agrarian_socialism|Voluntaryism|progressive_conservatism|anarchism|communitarianism|Isolationism|conservationism|permissivism|municipalism",
                "agrarian_socialism|Voluntaryism|progressive_conservatism|anarchism|communitarianism|Isolationism|environmentalism|permissivism|municipalism"
            ]
        },
        {
            name: "Shirism",
            color: "#8a6d3bff",
            description: "Modeled on the Shire of Tolkien's hobbits: small family farms, widely spread property, a nominal and distant king, almost no government to speak of, and a strong dislike of adventures, outsiders and new machines. Order is kept mostly by custom, gossip and good manners, and second breakfast is considered a basic right.",
            keys: [
                "distributism|flat_taxation|traditionalist_conservatism|anarcho_monarchism|communitarianism|Isolationism|neoluddism|civic_paternalism|regionalism",
                "distributism|flat_taxation|traditionalist_conservatism|anarcho_monarchism|communitarianism|armed_neutrality|neoluddism|civic_paternalism|regionalism"
            ]
        },
        {
            name: "Starfleetism",
            color: "#2f6fb5ff",
            description: "Inspired by the United Federation of Planets: a post-scarcity, money-free society run by capable experts, with strong civil liberties, a loose federation of worlds, wide-ranging scientific optimism and a firm rule against meddling in other civilizations' development. Exploration and personal growth replace the pursuit of wealth.",
            keys: [
                "free_socialism|collective_distribution|progressivism|technocracy|Cosmopolitanism|Non_Interventionism|prometheanism|civil_libertarianism|federalism",
                "utopian_socialism|collective_distribution|progressivism|technocracy|Cosmopolitanism|Non_Interventionism|prometheanism|civil_libertarianism|federalism"
            ]
        },
        {
            name: "Butlerianism",
            color: "#a0522dff",
            description: "Drawn from the Dune saga's great crusade against thinking machines. Feudal great houses, land-based wealth, a stern religious order and tribal loyalties hold an interstellar empire together, while any machine that imitates the human mind is forbidden. Human skill, discipline and faith take the place of automation.",
            keys: [
                "feudalism|lvt|religious_traditionalism|religious_authoritarianism|Tribalism|Imperialism|neoluddism|disciplinarianism|confederalism",
                "feudalism|lvt|religious_traditionalism|aristocracy|Tribalism|Imperialism|neoluddism|disciplinarianism|confederalism"
            ]
        },
        {
            name: "Heinleinian Stratocracy",
            color: "#5b6b3aff",
            description: "The political order of Robert Heinlein's novel Starship Troopers, where full citizenship is earned through voluntary federal service rather than granted by birth. It pairs a civic, service-based nationalism with a government run by those who served. How the novel's system should be read, as admirable, satirical or something else, is still argued.",
            keys: [
                "welfare_capitalism|Progressive_Taxation|conservatism|stratocracy|civic_nationalism|Interventionism|industrialism|securitism|centralism",
                "welfare_capitalism|Progressive_Taxation|conservatism|stratocracy|civic_nationalism|Realpolitik|industrialism|securitism|centralism"
            ]
        },
        {
            name: "Singularitarianism",
            color: "#3a8f8aff",
            description: "The belief that accelerating artificial intelligence will lead to a sudden leap beyond human limits, and that society should be organized around that moment. In this vision, expert-run systems plan the economy, minds and machines blur together, individuals keep their personal freedoms, and one planet-wide coordinating system holds it all together.",
            keys: [
                "cameralism|collective_distribution|progressivism|technocracy|egoism|Globalism|posthumanism|civil_libertarianism|hypercentralism",
                "cameralism|collective_distribution|progressivism|technocracy|Cosmopolitanism|Globalism|posthumanism|civil_libertarianism|hypercentralism"
            ]
        },
        {
            name: "Gay Technofascism",
            color: "#7a2f6bff",
            description: "A tongue-in-cheek internet label that pairs an all-powerful, corporate-run technological state with a culture of open personal freedom. Authority is total and expansionist, human enhancement is celebrated, and the central government is happy to let everyone live and love as they please, as long as they stay inside the system. It exists mostly as a joke about how oddly political labels can be combined, and critics point out that total authority and personal freedom rarely coexist in practice.",
            keys: [
                "corporatism|Progressive_Taxation|social_progressivism|totalitarianism|civic_nationalism|Imperialism|transhumanism|permissivism|hypercentralism",
                "corporatism|Progressive_Taxation|social_progressivism|totalitarianism|civic_nationalism|Imperialism|posthumanism|permissivism|hypercentralism"
            ]
        },
        {
            name: "Fully Automated Luxury Gay Space Capitalism",
            color: "#b8860bff",
            description: "The market-driven cousin of luxury space communism. Fully automated industry, private companies and loose federations of colonies provide abundance through voluntary trade instead of central planning, with low flat taxes and a government run like a well-managed business. Everyone is free to live as they like, from the Moon to the asteroid belt.",
            keys: [
                "laissez_faire|flat_taxation|civil_liberalism|neocameralism|Cosmopolitanism|Globalism|technocapitalism|permissivism|confederalism",
                "laissez_faire|flat_taxation|civil_liberalism|neocameralism|Cosmopolitanism|Globalism|extropianism|permissivism|confederalism"
            ]
        },
        {
            name: "Golden Age Piracy",
            color: "#1f3a5fff",
            description: "Based on the pirate crews of the early 1700s, which often elected their captains, voted on major decisions and divided plunder by agreed shares under a written code. Loose havens and alliances of crews replace states, loyalty runs to the crew, and rules exist mostly to keep the ship afloat. Historians still debate how democratic the real crews were.",
            keys: [
                "syndicalism|collective_distribution|civil_liberalism|direct_democracy|communitarianism|Realpolitik|instrumentalism|permissivism|confederalism",
                "syndicalism|collective_distribution|civil_liberalism|direct_democracy|communitarianism|armed_neutrality|instrumentalism|permissivism|confederalism"
            ]
        },
        {
            name: "Merchant Republicanism",
            color: "#7a5c2eff",
            description: "Modeled on trading cities such as the Hanseatic League and Venice: self-governing communities run by established merchant families and guilds, where trade is valued above conquest and taxes are low and flat. Cities cooperate through loose leagues instead of answering to a single ruler, and order comes from contracts, guild rules and a shared sense of civic duty.",
            keys: [
                "neo_corporatism|flat_taxation|conservative_liberalism|aristocracy|communitarianism|Globalism|instrumentalism|civic_paternalism|confederalism",
                "neo_corporatism|flat_taxation|conservative_liberalism|aristocracy|communitarianism|Globalism|industrialism|civic_paternalism|confederalism"
            ]
        },
        {
            name: "Enlightened Centrism",
            color: "#6b7b8cff",
            description: "A label, often used teasingly, for the view that sensible answers lie between the extremes. It favors a mixed Third Way economy, moderate progressive taxes, representative government, a civic national identity, practical foreign policy and steady problem-solving over ideology. Supporters call it common sense; critics say that splitting the difference is not always right.",
            keys: [
                "third_way|Progressive_Taxation|civil_liberalism|representative_democracy|civic_nationalism|Realpolitik|instrumentalism|civic_paternalism|federalism",
                "third_way|Progressive_Taxation|civil_liberalism|representative_democracy|civic_nationalism|Realpolitik|ecomodernism|civic_paternalism|federalism"
            ]
        },
        {
            name: "Lunar Rational Anarchism",
            color: "#4a4a7aff",
            description: "Inspired by the free Moon of Robert Heinlein's novel The Moon Is a Harsh Mistress: a society with no rulers, where free markets and voluntary agreements settle everything, individuals look after their own interests, and the settlements run themselves. A clever, helpful machine intelligence plays a bigger part than any government. Its motto is that there is no such thing as a free lunch.",
            keys: [
                "laissez_faire|Voluntaryism|civil_liberalism|anarchism|egoism|Non_Interventionism|prometheanism|permissivism|municipalism",
                "laissez_faire|Voluntaryism|civil_liberalism|anarchism|egoism|Non_Interventionism|posthumanism|permissivism|municipalism"
            ]
        }
    ];

    EASTER_EGGS.forEach(function (egg) {
        egg.keys.forEach(function (key) { labelMapping[key] = egg.name; });
        labelColors[egg.name] = egg.color;
        descriptions[egg.name] = egg.description;
    });
    ideologyGroups[EASTER_EGG_GROUP] = EASTER_EGGS.map(function (egg) { return egg.name; });

    // Ideologies from the original data that were already meant as easter eggs: show them in the Easter Eggs
    // group too (they keep their requirements, colour and description; only the group changes).
    const MOVED_TO_EASTER_EGGS = ["Neo-Libertarian Falangism"];
    MOVED_TO_EASTER_EGGS.forEach(function (name) {
        Object.keys(ideologyGroups).forEach(function (group) {
            if (group === EASTER_EGG_GROUP) return;
            const i = ideologyGroups[group].indexOf(name);
            if (i > -1) ideologyGroups[group].splice(i, 1);
        });
        if (ideologyGroups[EASTER_EGG_GROUP].indexOf(name) === -1) ideologyGroups[EASTER_EGG_GROUP].push(name);
    });
})();
