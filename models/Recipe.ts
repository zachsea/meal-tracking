import mongoose, { Schema, Document, Types } from "mongoose";

export interface IIngredient {
  _id: Types.ObjectId;
  name: string;
  amount: string; // free-form e.g. "200g", "1 cup"
  kcal: number;
  protein: number;
  fiber: number;
  carbs: number;
  sugar: number;
  sodium: number;
}

export interface IRecipeVersion {
  _id: Types.ObjectId;
  versionNumber: number;
  servingsMade: number;
  // top-level sums, may not necessarily equal the sum of ingredients, no guarantee
  kcal: number;
  protein: number;
  fiber: number;
  carbs: number;
  sugar: number;
  sodium: number;
  // optional structured ingredients
  ingredients: IIngredient[];
  createdAt: Date;
  changeNote?: string;
}

export interface IRecipe extends Document {
  userId: string;
  name: string;
  ingredientNotes: string[]; // simple string list kept for freeform notes
  servingSize: string;
  recipeSource?: string;
  category?: string;
  notes?: string;
  versions: IRecipeVersion[];
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema = new Schema<IIngredient>(
  {
    name: { type: String, required: true },
    amount: { type: String, required: true },
    kcal: { type: Number, required: true, default: 0 },
    protein: { type: Number, required: true, default: 0 },
    fiber: { type: Number, required: true, default: 0 },
    carbs: { type: Number, required: true, default: 0 },
    sugar: { type: Number, required: true, default: 0 },
    sodium: { type: Number, required: true, default: 0 },
  },
  { _id: true },
);

const RecipeVersionSchema = new Schema<IRecipeVersion>(
  {
    versionNumber: { type: Number, required: true },
    servingsMade: { type: Number, required: true },
    kcal: { type: Number, required: true },
    protein: { type: Number, required: true },
    fiber: { type: Number, required: true },
    carbs: { type: Number, required: true },
    sugar: { type: Number, required: true },
    sodium: { type: Number, required: true },
    ingredients: { type: [IngredientSchema], default: [] },
    changeNote: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const RecipeSchema = new Schema<IRecipe>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    ingredientNotes: { type: [String], default: [] },
    servingSize: { type: String, required: true },
    recipeSource: { type: String },
    category: { type: String },
    notes: { type: String },
    versions: { type: [RecipeVersionSchema], default: [] },
  },
  { timestamps: true },
);

RecipeSchema.index({ userId: 1, createdAt: -1 });

export const Recipe =
  mongoose.models.Recipe || mongoose.model<IRecipe>("Recipe", RecipeSchema);
