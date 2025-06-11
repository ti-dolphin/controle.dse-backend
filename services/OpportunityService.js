const OpportunityRepository = require("../repositories/OpportunityRepository");
const pool = require("../database");
const ProjectService = require("./ProjectService");
const fireBaseService = require("./fireBaseService");
const utils = require("../utils");
const EmailService = require("./EmailService");
const OpportunityView = require("../views/OpportunityViews");
const {prisma} = require("../database");

class OpportunityService {
}

module.exports = OpportunityService;
