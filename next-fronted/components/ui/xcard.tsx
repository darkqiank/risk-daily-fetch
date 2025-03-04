import React from "react";
import { Card, Avatar, Typography, Divider, Tag, Image } from "antd";
import { LinkOutlined } from "@ant-design/icons";

const { Meta } = Card;
const { Text, Link } = Typography;

interface XCardProps {
  item: any;
}

const XCard: React.FC<XCardProps> = ({ item }) => {
  return (
    <Card key={item.x_id} style={{ marginBottom: 16 }}>
      <Meta
        avatar={
          <Avatar
            src={`${process.env.NEXT_PUBLIC_BASE_IMAGES_URL}${item.user_id}.png`}
          />
        }
        description={
          <Text style={{ fontSize: 12 }} type="secondary">
            {new Date(
              item.data.created_at ?? item.data[0]?.data.created_at,
            ).toLocaleString()}
          </Text>
        }
        title={
          <Link href={item.user_link} target="_blank">
            @{item.username}
          </Link>
        }
      />
      {item.x_id.startsWith("tweet-") && (
        <>
          <Divider />
          <Text>{item.data.full_text}</Text>
          {item.data.urls && Object.keys(item.data.urls).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Tag color="green">Links</Tag>
              {Object.entries(item.data.urls).map(([_, links]: any) =>
                links
                  .filter((link: string) => link !== null)
                  .map((link: string, index: any) => (
                    <div key={index}>
                      <Link href={link} target="_blank">
                        <LinkOutlined />{" "}
                        {link.length > 50
                          ? `${link.substring(0, 50)}...`
                          : link}
                      </Link>
                    </div>
                  )),
              )}
            </div>
          )}
          {item.data.medias && Object.keys(item.data.medias).length > 0 && (
            <div style={{ marginTop: 8 }}>
              <Tag color="orange">Medias</Tag>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {Object.entries(item.data.medias).map(([_, mediaLinks]: any) =>
                  mediaLinks.map((media: any, index: any) => (
                    <Image key={index} alt="media" src={media} width={100} />
                  )),
                )}
              </div>
            </div>
          )}
        </>
      )}
      {item.x_id.startsWith("profile-conversation-") &&
        item.data.map((subItem: any) => (
          <div key={subItem.x_id}>
            <Divider />
            <Text>{subItem.data.full_text}</Text>
            {subItem.data.urls && Object.keys(subItem.data.urls).length > 0 && (
              <div style={{ marginTop: 8 }}>
                <Tag color="green">Links</Tag>
                {Object.entries(subItem.data.urls).map(([_, links]: any) =>
                  links
                    .filter((link: any) => link !== null)
                    .map((link: any, index: any) => (
                      <div key={index}>
                        <Link href={link} target="_blank">
                          <LinkOutlined />{" "}
                          {link.length > 50
                            ? `${link.substring(0, 50)}...`
                            : link}
                        </Link>
                      </div>
                    )),
                )}
              </div>
            )}
            {subItem.data.medias &&
              Object.keys(subItem.data.medias).length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <Tag color="orange">Medias</Tag>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {Object.entries(subItem.data.medias).map(
                      ([_, mediaLinks]: any) =>
                        mediaLinks.map((media: any, index: any) => (
                          <Image
                            key={index}
                            alt="media"
                            src={media}
                            width={100}
                          />
                        )),
                    )}
                  </div>
                </div>
              )}
          </div>
        ))}
    </Card>
  );
};

export default XCard;
