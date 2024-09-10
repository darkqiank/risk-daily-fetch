import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  Link,
  Image,
  Avatar,
} from "@nextui-org/react";

export interface PreviewData {
  url: string;
  description: string;
  title: string;
  logo: string;
  image: string;
  publisher: string;
  video: string;
}

const PreviewCard = (data: any) => {
  return (
    <Card
      isFooterBlurred
      className="w-full h-[300px] col-span-12 sm:col-span-7"
    >
      <CardHeader className="absolute bg-black/40 z-10 top-0 flex-col items-start">
        <p className="text-tiny text-white/60 uppercase font-bold">
          {data.publisher}
        </p>
        <Link isExternal href={data.url}>
          {" "}
          <h4 className="text-white/90 font-medium text-xl">
            {data.title?.length > 150
              ? `${data.title.substring(0, 150)}...`
              : data.title}
          </h4>{" "}
        </Link>
      </CardHeader>
      <Image
        isZoomed
        removeWrapper
        alt="Relaxing app background"
        className="z-0 w-full h-full object-cover"
        src={data.image || "https://nextui.org/images/card-example-4.jpeg"}
      />
      <CardFooter className="absolute bg-black/40 bottom-0 z-10 flex items-center justify-between gap-3">
        <div className="flex flex-grow gap-2 items-center">
          <Avatar
            alt="source logo"
            className="w-12 h-12 bg-black"
            name={data.publisher}
            src={
              data.logo || "https://nextui.org/images/breathing-app-icon.jpeg"
            }
          />

          <div className="flex flex-col">
            <p className="text-tiny text-white/60">{data.publisher}</p>
            <p className="text-tiny text-white/60">
              {data.description?.length > 50
                ? `${data.description.substring(0, 50)}...`
                : data.description}
            </p>
          </div>
        </div>
        <Button isExternal as={Link} href={data.url} radius="full" size="sm">
          See more
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PreviewCard;
