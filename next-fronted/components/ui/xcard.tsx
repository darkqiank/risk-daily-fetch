import React from "react";
import {
  Card,
  CardHeader,
  CardBody,
  User,
  Link,
  Chip,
  Divider,
  Image,
} from "@nextui-org/react"; // Adjust the imports according to your UI library

interface XCardProps {
  item: any;
}

const XCard: React.FC<XCardProps> = ({ item }) => {
  return (
    <Card key={item.x_id}>
      <CardHeader className="flex items-center justify-between gap-3">
        <User
          avatarProps={{
            src: `${process.env.NEXT_PUBLIC_BASE_IMAGES_URL}${item.user_id}.png`,
          }}
          description={
            <Link isExternal href={item.user_link} size="sm">
              @{item.username}
            </Link>
          }
          name={item.username}
        />
        <span className="text-sm text-gray-300 ml-4">
          {new Date(
            item.data.created_at ?? item.data[0]?.data.created_at,
          ).toLocaleString()}
        </span>
      </CardHeader>
      {item.x_id.startsWith("tweet-") && (
        <>
          <Divider />
          <CardBody
            className="flex flex-col space-y-4"
            style={{ wordBreak: "break-all" }}
          >
            <span>{item.data.full_text}</span>
            {item.data.urls && Object.keys(item.data.urls).length > 0 && (
              <span className="flex flex-col space-y-2">
                <Chip color="success" size="sm" variant="dot">
                  Links
                </Chip>
                {Object.entries(item.data.urls).map(([shortLink, links]: any) =>
                  links
                    .filter((link: string) => link !== null)
                    .map((link: string, index: any) => (
                      <Link
                        key={index}
                        showAnchorIcon
                        href={link}
                        rel="noopener"
                        target="_blank"
                      >
                        {link.length > 50
                          ? `${link.substring(0, 50)}...`
                          : link}
                      </Link>
                    )),
                )}
              </span>
            )}
            <div>
              {item.data.medias && Object.keys(item.data.medias).length > 0 && (
                <span className="flex flex-col space-y-2">
                  <Chip color="warning" size="sm" variant="dot">
                    Medias
                  </Chip>
                  <div>
                    <span className="flex flex-wrap gap-1">
                      {Object.entries(item.data.medias).map(
                        ([shortMedia, mediaLinks]: any) =>
                          mediaLinks.map((media: any, index: any) => (
                            <Image
                              key={index}
                              alt="media"
                              src={media}
                              width={100}
                            />
                          )),
                      )}
                    </span>
                  </div>
                </span>
              )}
            </div>
          </CardBody>
        </>
      )}
      {item.x_id.startsWith("profile-conversation-") &&
        item.data.map((subItem: any) => (
          <div key={subItem.x_id}>
            <Divider />
            <CardBody
              className="flex flex-col space-y-4"
              style={{ wordBreak: "break-all" }}
            >
              <span>{subItem.data.full_text}</span>
              {subItem.data.urls &&
                Object.keys(subItem.data.urls).length > 0 && (
                  <span className="flex flex-col space-y-2">
                    <Chip color="success" size="sm" variant="dot">
                      Links
                    </Chip>
                    {Object.entries(subItem.data.urls).map(
                      ([shortLink, links]: any) =>
                        links
                          .filter((link: string) => link !== null)
                          .map((link: string, index: any) => (
                            <Link
                              key={index}
                              showAnchorIcon
                              href={link}
                              rel="noopener"
                              target="_blank"
                            >
                              {link.length > 50
                                ? `${link.substring(0, 50)}...`
                                : link}
                            </Link>
                          )),
                    )}
                  </span>
                )}
              <div>
                {subItem.data.medias &&
                  Object.keys(subItem.data.medias).length > 0 && (
                    <span className="flex flex-col space-y-2">
                      <Chip color="warning" size="sm" variant="dot">
                        Medias
                      </Chip>
                      <div>
                        <span className="flex flex-wrap gap-1">
                          {Object.entries(subItem.data.medias).map(
                            ([shortMedia, mediaLinks]: any) =>
                              mediaLinks.map((media: any, index: any) => (
                                <Image
                                  key={index}
                                  alt="media"
                                  src={media}
                                  width={100}
                                />
                              )),
                          )}
                        </span>
                      </div>
                    </span>
                  )}
              </div>
            </CardBody>
          </div>
        ))}
    </Card>
  );
};

export default XCard;
