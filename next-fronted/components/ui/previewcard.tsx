import { Avatar as MAvatar } from "@mui/material";
import {
  Button,
  Card,
  CardFooter,
  CardHeader,
  Link,
  Image,
  Skeleton,
  CardBody,
} from "@nextui-org/react";

export const PreviewCard = (data: any) => {
  return (
    <Card
      // isFooterBlurred
      className="w-full h-[150px] col-span-12 sm:col-span-7"
    >
      <CardHeader className="absolute bg-black/40 z-10 top-0 flex-col items-start">
        <p className="text-tiny text-white/60 uppercase font-bold">
          {data.siteName}
        </p>
        <Link isExternal href={data.url}>
          <h4
            className="text-white/90 font-medium text-l"
            style={{ wordBreak: "break-all" }}
          >
            {data.title?.length > 100
              ? `${data.title.substring(0, 100)}...`
              : data.title}
          </h4>
        </Link>
      </CardHeader>
      <Image
        isZoomed
        removeWrapper
        alt="Relaxing app background"
        className="z-0 w-full h-full object-cover"
        src={
          data.images?.[0] || "https://nextui.org/images/card-example-4.jpeg"
        }
      />
      <CardFooter className="absolute bg-black/40 bottom-0 z-10 flex items-center justify-between gap-3">
        <div className="flex flex-grow gap-2 items-center">
          <MAvatar
            alt={data.siteName}
            className="w-12 h-12 bg-black"
            src={
              data.favicons?.[0] ||
              "https://nextui.org/images/breathing-app-icon.jpeg"
            }
          />

          <div className="flex flex-col">
            <p className="text-tiny text-white/60">{data.siteName}</p>
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

export const PreviewCardV2 = (data: any) => {
  return (
    <Card
      // isFooterBlurred
      // className="w-full h-[150px] col-span-12 sm:col-span-7 min-w-[200px]"
      className="w-full min-h-[50px] col-span-12 sm:col-span-7 min-w-[200px]"
    >
      <CardBody>
        <div className="flex gap-6 items-center justify-center">
          <div className="w-1/3 h-full">
            <Image
              removeWrapper
              alt="Album cover"
              className="w-full h-[120px] object-cover"
              shadow="md"
              src={
                data.images?.[0] ||
                "https://nextui.org/images/card-example-4.jpeg"
              }
            />
          </div>
          <div className="flex flex-col col-span-6 md:col-span-8 w-2/3">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-3 items-center">
                  <MAvatar
                    alt={data.siteName}
                    className="bg-black"
                    src={
                      data.favicons?.[0] ||
                      "https://nextui.org/images/breathing-app-icon.jpeg"
                    }
                    style={{ width: "28px", height: "28px" }}
                  />
                  <p className="text-tiny uppercase font-bold opacity-60">
                    {data.siteName}
                  </p>
                </div>
                <p className="text-tiny opacity-40">{data.date}</p>
              </div>
              <Link isExternal href={data.url}>
                <h4
                  className="font-medium text-xl"
                  style={{ wordBreak: "break-all" }}
                >
                  {data.title?.length > 100
                    ? `${data.title.substring(0, 100)}...`
                    : data.title}
                </h4>
              </Link>
              <p className="text-small">
                {data.description?.length > 50
                  ? `${data.description.substring(0, 50)}...`
                  : data.description}
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export const SkeletonCard = () => {
  return (
    <Card
      // isFooterBlurred
      className="w-full h-[150px] col-span-12 sm:col-span-7"
    >
      <CardHeader className="absolute z-10 top-0 flex-col items-start gap-3">
        {/* <Skeleton animation="wave" className="text-tiny w-1/2" variant="text" />
        <Skeleton
          animation="wave"
          className="font-medium text-xl w-full"
          variant="text"
        /> */}
        <Skeleton className="h-3 w-1/2 rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </CardHeader>
      <CardFooter className="absolute bottom-0 z-10 flex items-center justify-between gap-3">
        <div className="flex flex-grow gap-2 items-center">
          {/* <Skeleton
            animation="wave"
            height={40}
            variant="circular"
            width={40}
          /> */}
          <Skeleton className="flex rounded-full w-12 h-12 rounded-full" />

          <div className="flex flex-col w-full gap-3">
            {/* <Skeleton
              animation="wave"
              className="text-tiny w-1/2 "
              variant="text"
            />
            <Skeleton
              animation="wave"
              className="text-tiny w-full "
              variant="text"
            /> */}
            <Skeleton className="h-3 w-1/2 rounded-lg" />
            <Skeleton className="h-3 w-full rounded-lg" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
