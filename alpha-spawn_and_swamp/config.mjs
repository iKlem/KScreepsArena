import { ATTACK, CARRY, HEAL, MOVE, RANGED_ATTACK, WORK } from "game/constants";
import { Creep } from "game/prototypes";

/** @type {Map<String, Creep[]>} */
export const population = new Map([
	["worker", []],
	["melee", []],
	["archer", []],
	["healer", []]
]);

export const unit_definitions = [
	{
		"type": "worker",
		"body": [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE],
		"max": 2
	},
	{
		"type": "melee",
		"body": [ATTACK, MOVE, MOVE, MOVE],
		"max": 2
	},
	{
		"type": "archer",
		"body": [RANGED_ATTACK, MOVE, MOVE, MOVE],
		"max": 2
	},
	{
		"type": "healer",
		"body": [HEAL, MOVE, MOVE, MOVE],
		"max": 2
	}
]
export const attack_max_range = 10;
