import mongoose from "mongoose";
const visitorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    count: {
        type: Number,
        required: true,
        default: 0,
    }
});

const visitorModel = mongoose.models.Visitor || mongoose.model("Visitor", visitorSchema);
// prevent model overwrite error in development
export default visitorModel;