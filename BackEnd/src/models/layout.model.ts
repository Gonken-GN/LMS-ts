import mongoose, { Document, Model, Schema, model } from "mongoose";

interface IFaqItem extends Document {
  question: string;
  answer: string;
}

interface ICategory extends Document {
  title: string;
}

interface IBannerImage extends Document {
  public_id: string;
  url: string;
}

interface ILayout extends Document {
  type: string;
  faq: IFaqItem[];
  categories: ICategory[];
  banner: {
    image: IBannerImage;
    title: string;
    subTitle: string;
  };
}

const faqSchema = new Schema<IFaqItem>({
  question: {
    type: String,
  },
  answer: {
    type: String,
  },
});

const categoriesSchema = new Schema<ICategory>({
  title: {
    type: String,
  },
});

const bannerImageSchema = new Schema<IBannerImage>({
  public_id: {
    type: String,
  },
  url: {
    type: String,
  },
});

const layoutSchema = new Schema<ILayout>({
  type: {
    type: String,
  },
  faq: [faqSchema],
  categories: [categoriesSchema],
  banner: {
    image: bannerImageSchema,
    title: {
      type: String,
    },
    subTitle: {
      type: String,
    },
  },
});

const layoutModel: Model<ILayout> = model("Layout", layoutSchema);

export default layoutModel;
