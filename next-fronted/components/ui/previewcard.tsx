import {
  Avatar as MAvatar,
  Card,
  Button,
  Typography,
  Skeleton,
  Image,
} from "antd";
import { LinkOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

export const PreviewCard = (data: any) => {
  return (
    <Card
      actions={[
        <Button
          key="see-more"
          href={data.url}
          icon={<LinkOutlined />}
          target="_blank"
          type="link"
        >
          See more
        </Button>,
      ]}
      cover={
        <Image
          alt="Preview image"
          src={
            data.images?.[0] || "https://nextui.org/images/card-example-4.jpeg"
          }
          style={{ height: 150, objectFit: "cover" }}
        />
      }
    >
      <Card.Meta
        avatar={
          <MAvatar
            src={
              data.favicons?.[0] ||
              "https://nextui.org/images/breathing-app-icon.jpeg"
            }
          />
        }
        description={
          data.description?.length > 50
            ? `${data.description.substring(0, 50)}...`
            : data.description
        }
        title={
          <a href={data.url} rel="noopener noreferrer" target="_blank">
            {data.title}
          </a>
        }
      />
    </Card>
  );
};

export const PreviewCardV2 = (data: any) => {
  return (
    <Card>
      <div style={{ display: "flex", gap: 12 }}>
        <Image
          alt="Album cover"
          src={
            data.images?.[0] || "https://nextui.org/images/card-example-4.jpeg"
          }
          style={{ width: 120, height: 120, objectFit: "cover" }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MAvatar
                size={28}
                src={
                  data.favicons?.[0] ||
                  "https://nextui.org/images/breathing-app-icon.jpeg"
                }
              />
              <Text strong type="secondary">
                {data.siteName}
              </Text>
            </div>
            <Text type="secondary">{data.date}</Text>
          </div>
          <Title level={4} style={{ marginTop: 8 }}>
            <a href={data.url} rel="noopener noreferrer" target="_blank">
              {data.title}
            </a>
          </Title>
          <Text>
            {data.description?.length > 50
              ? `${data.description.substring(0, 50)}...`
              : data.description}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export const SkeletonCard = () => {
  return (
    <Card>
      <Skeleton.Image style={{ width: "100%", height: 150 }} />
      <Card.Meta
        avatar={<Skeleton.Avatar active size="large" />}
        description={<Skeleton.Input active style={{ width: "80%" }} />}
        title={<Skeleton.Input active style={{ width: "60%" }} />}
      />
    </Card>
  );
};
