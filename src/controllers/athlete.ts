import { Request, Response, NextFunction} from "express";
import { validationResult } from "express-validator";

import Athlete from "../models/athlete";

interface CustomError extends Error {
  statusCode?: number;
  data?: any[];
}

type RequestBody = {
  firstName?: string;
  lastName?: string;
  wins?: number;
  gender?: string;
  losses?: number;
  nationality?: string;
  age?: number;
  nickName: string;
}

type RequestParams = {
  athleteId: string;
}

const getAthletes = async (req: Request, res: Response) => {
  try {
    const athletes = await Athlete.findAll();
    if (!athletes) {
      const error = new Error("Failed to fetch athletes.") as CustomError;
      error.statusCode = 422;
      throw error;
    };
    res.status(200).json({
      message: "Successfully fetched athletes",
      athletes: athletes
    })
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch athletes",
      error: error
    })
  }
}

const getAthlete = async (req: Request, res: Response) => {
  const params = req.params as RequestParams;
  try {
    const athlete = await Athlete.findByPk(params.athleteId);
    if (!athlete) {
      return res.status(404).json({
        message: "Athlete with that ID not found",
        id: params.athleteId
      });
    }
    return res.status(200).json({
      message: "Successfully fetched athlete.",
      athlete: athlete
    })
  } catch (error) {
    res.status(404).json({
      message: "Failed to fetch athlete.",
      error: error
    })
  }
}

const createAthlete = async (req: Request, res: Response) => {
  const body = req.body as RequestBody;
  const wins = body.wins;
  const losses = body.losses;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.') as CustomError;
    error.statusCode = 422;
    error.data = errors.array();
    return res.status(422).json({
      error: error
    });
  }
  try {
    const athlete = await Athlete.create({
      firstName: body.firstName,
      lastName: body.lastName,
      nickName: body.nickName,
      age: body.age,
      nationality: body.nationality,
      gender: body.gender,
      wins: wins ? wins : 0,
      losses: losses ? losses: 0
    });
    return res.status(201).json({
      message: "Athlete successfully created.",
      athlete: athlete
    });
  } catch (error) {
    res.status(500).json({
      message: "Athlete creation failed."
    });
  }
}

const updateAthlete = async (req: Request, res: Response) => {
  const body = req.body as RequestBody;
  const params = req.params as RequestParams;
  try {
    const loadedAthlete = await Athlete.findByPk(params.athleteId);
    if (!loadedAthlete) {
      return res.status(404).json({
        message: "Athlete with that ID not found."
      });
    }
    if (body.age) {
      loadedAthlete.age = body.age;
    }
    if (body.firstName) {
      loadedAthlete.firstName = body.firstName;
    }
    if (body.lastName) {
      loadedAthlete.lastName = body.lastName;
    }
    if (body.gender) {
      loadedAthlete.gender = body.gender;
    }
    if (body.nationality) {
      loadedAthlete.nationality = body.nationality;
    }
    if (body.wins !== undefined) {
      loadedAthlete.wins = body.wins;
    }
    if (body.losses !== undefined) {
      loadedAthlete.losses = body.losses;
    }
    await loadedAthlete.save();
    return res.status(200).json({
      message: "Successfully updated athlete.",
      athlete: loadedAthlete
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update athlete",
      error: error
    });
  }
}

const deleteAthlete = async (req: Request, res: Response) => {
  const params = req.params as RequestParams;
  try {
    const result = await Athlete.destroy({
      where: {
        id: params.athleteId
      },
      force: true
    });
    if (result === 0) {
      return res.status(500).json({
        message: "Failed to delete athlete",
      })
    }
    res.status(200).json({
      message: "Athlete successfully destroyed.",
      result: result
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete athlete",
      error: error
    })
  }
}

export default { getAthletes, createAthlete, getAthlete, updateAthlete, deleteAthlete }
