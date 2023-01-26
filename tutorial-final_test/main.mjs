import { ATTACK, CARRY, ERR_NOT_IN_RANGE, HEAL, MOVE, RANGED_ATTACK, RESOURCE_ENERGY, WORK } from 'game/constants';
import { Creep, OwnedStructure, Source, StructureContainer, StructureSpawn, StructureTower } from 'game/prototypes';
import { getObjectsByPrototype } from 'game/utils';

/** @type {Array<Creep>} */
const my_creeps = [];
/** @type {Array<StructureSpawn>} */
let my_spawns = [];
/** @type {Array<StructureContainer>} */
let my_containers = [];
/** @type {Array<StructureTower>} */
let my_towers = [];

/** @type {Array<Source>} */
let sources;

const population = {
    'worker': 0,
    'melee': 0,
    'archer': 0,
    'healer': 0,
}
const unit_definitions = [
    {
        "type": "worker",
        "body": [WORK, WORK, CARRY, CARRY, MOVE, MOVE],
        "max": 1
    },
    {
        "type": "melee",
        "body": [ATTACK, MOVE],
        "max": 2
    },
    {
        "type": "archer",
        "body": [RANGED_ATTACK, MOVE],
        "max": 2
    },
    {
        "type": "healer",
        "body": [HEAL, MOVE],
        "max": 2
    }
]
const attack_max_range = 10;

export function loop() {
    sources = getObjectsByPrototype(Source).filter(s => s.energy > 0);

    getObjectsByPrototype(StructureSpawn).filter(s => s.my).forEach(s => {
        if (!my_spawns.find(ms => ms.id == s.id)) {
            my_spawns.push(s);
        }
    });

    do_spawn();

    my_creeps.forEach((creep) => {
        do_heal_unit(creep);
        do_melee_attack(creep);
        do_ranged_attack(creep);
        work_unit(creep);
    });
}

function do_spawn() {
    let spawning = false;
    unit_definitions.some((unit_data) => {
        if (population[unit_data.type] < unit_data.max) {
            // console.log(`Tentative de creation de ${unit_data.type}`)
            my_spawns.some(spawn => {
                const new_creep = spawn.spawnCreep(unit_data.body);
                if (new_creep.object) {
                    console.log(`Creation en cours de ${unit_data.type}`)
                    population[unit_data.type]++;
                    my_creeps.push(new_creep.object);
                    spawning = true;
                    return spawning;
                // } else {
                //     console.log(`Erreur lors de la creation de ${unit_data.type}`)
                //     console.log(new_creep.error);
                }
            });
        }
        if (spawning) return spawning;
    });
}

/** @param {Creep} creep */
function do_ranged_attack(creep) {
    if (!creep.id || !creep.body.find(b => b.type == RANGED_ATTACK)) {
        return false;
    }

    const enemies = getObjectsByPrototype(Creep).filter(creep => !creep.my)
    const nearest_enemy = creep.findClosestByPath(enemies);
    if (nearest_enemy && creep.getRangeTo(nearest_enemy) < attack_max_range) {
        if (creep.rangedAttack(nearest_enemy) === ERR_NOT_IN_RANGE) {
            creep.moveTo(nearest_enemy);
        }
    } else {
        const my_healer_buddy = my_creeps.find(i => i.body.find(b => b.type == HEAL));
        if (my_healer_buddy) {
            creep.moveTo(my_healer_buddy);
        }
    }
}

/** @param {Creep} creep */
function do_melee_attack(creep) {
    if (!creep.id || !creep.body.find(b => b.type == ATTACK)) {
        return false;
    }

    const enemies = getObjectsByPrototype(Creep).filter(creep => !creep.my)
    const nearest_enemy = creep.findClosestByPath(enemies);
    if (nearest_enemy && creep.getRangeTo(nearest_enemy) < attack_max_range) {
        if (creep.attack(nearest_enemy) === ERR_NOT_IN_RANGE) {
            creep.moveTo(nearest_enemy);
        }
    }
}

/** @param {Creep} creep */
function do_heal_unit(creep) {
    if (!creep.id || !creep.body.find(b => b.type == HEAL)) {
        return false;
    }

    const my_damaged_creeps = my_creeps.filter(i => i.hits < i.hitsMax);
    if (my_damaged_creeps.length > 0) {
        if (creep.heal(my_damaged_creeps[0]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(my_damaged_creeps[0]);
        }
    } else {
        const my_melee_buddy = my_creeps.find(i => i.body.find(b => b.type == ATTACK));
        if (my_melee_buddy) {
            creep.moveTo(my_melee_buddy);
        }
    }
}

/** @param {Creep} creep */
function work_unit(creep) {
    if (!creep.id || !creep.body.find(b => b.type == WORK)) {
        return false;
    }

    if (creep.store.getFreeCapacity(RESOURCE_ENERGY)) { // Si le Creep a de la place --> != 0 --> false
        const nearest_container = creep.findClosestByRange(my_containers);
        if (nearest_container) {
            // TODO: ajouter logique container
        } else {
            const nearest_source = creep.findClosestByRange(sources);
            if (nearest_source) {
                if (creep.harvest(nearest_source) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearest_source);
                }
            }
        }
    } else { // Si nous avons notre stockage interne plein
        const nearest_spawn = creep.findClosestByRange(my_spawns);
        if (nearest_spawn) {
            if (creep.transfer(nearest_spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.moveTo(nearest_spawn);
            }
        }
    }
}

function get_object_by_position() {}


/*
\
4 unites (a minima) :
- WORK -- recolte l'energie / faire les constructions
- ATTACK -- attaque & defense
- HEAL -- guerison mais coute cher (250) -- donc possiblement pas des le depart
- RANGED_ATTACK (facultatif)
    - si facultatif alors ATTACK dois sois etre plus puissant ou plusieurs fois

"taille" du corp d'une unite
- WORK
    - WORK CARRY MOVE MOVE --> 250E
    - WORK WORK CARRY CARRY MOVE MOVE MOVE MOVE --> 500E
- ATTACK
    - ATTACK MOVE --> 130E
- HEAL
    - HEAL MOVE --> 300E
- RANGED_ATTACK
    - RANGED_ATTACK MOVE --> 200E

tour ?
- si oui
    - demander plus de WORK
    - soit de la construire a l'oppose des ennemies et de notre spawn
    - soit de la construire entre les ennemies et le spawn (DEFENSIF)
- si non
    - on fait plus d'unites ATTACK/RANGED_ATTACK

container ?
- non depend de ce qu'on aura

*/
