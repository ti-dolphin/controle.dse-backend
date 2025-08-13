const EmailService = require("../services/EmailService");
const ChecklistService = require('../services/CheckListService');
class PatrimonyScheduler {

  static startchecklistVerification = ( ) =>  { 
      const oneHourInMilliseconds = 1 * 60 * 60 * 1000;
      const interval = 24 * oneHourInMilliseconds;
     setInterval(() => {
       try {
         ChecklistService.verifyChecklistItems();
       } catch (e) {
         console.error("Error during checklist verification:", e);
       }
     }, interval);
  }

  static startEmailSchedule() {
    const oneHourInMilliseconds = 1 * 60 * 60 * 1000;
    const interval = 24 * oneHourInMilliseconds;
    setInterval(async () => {
      try {
        ChecklistService.sendChecklistEmails();
      } catch (error) {
        console.error("Error during scheduled email sending:", error);
      }
    }, interval); // 10 seconds (10000 milliseconds)
  }
  
}

module.exports = PatrimonyScheduler;
