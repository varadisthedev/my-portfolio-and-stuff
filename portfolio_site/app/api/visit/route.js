import connectToMongo from "@/lib/connectToMongo.ts";
import Visitor from "@/models/Visitor";

export async function GET() {
  await connectToMongo();

  await Visitor.updateOne(
    { name: "main" },
    { $inc: { count: 1 } },
    { upsert: true }, // create new doc if it doesn't exist in collection
  );
  // This will increment the count by 1 if the document with name "main"

  const updatedDoc = await Visitor.findOne({
    name: "main",
  });

  return Response.json({
    count: updatedDoc?.count || 0,
  });
  // checks first if it exists, if it does, it increments the count by 1, if it doesn't, it creates a new document with count 1
}
