import React, { useState } from "react";
import {
  DesktopOutlined,
  ContactsFilled,
  GithubOutlined,
  TeamOutlined,
  PhoneFilled,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Breadcrumb, FloatButton, Layout, Menu, theme, Tooltip } from "antd";
import MenuBuilder from "./components/MenuBuilder";
import Logo from "./components/Logo";

const { Header, Content, Footer, Sider } = Layout;

,
  } = theme.useToken();

  const items = (showIcon) => [
    ...generateMenuWithChildren(menus, showIcon),
  ];

  const allKeys = getAllKeys(menus);
  console.log(menus, "menus");

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        breakpoint="lg"
        width={280}
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <Logo collapsed={collapsed} />
        <Menu
          defaultOpenKeys={allKeys}
          theme="dark"
          defaultSelectedKeys={["/home"]}
          mode="inline"
          items={items(true)}
        />
      </Sider>
      <Layout
        style={{
          maxWidth: "100vw",
          maxHeight: "100vh",
        }}
      >
        <Header
          style={{
            paddingLeft,
            background,
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              width: "100%",
            }}
          >
            <Menu
              theme="light"
              defaultSelectedKeys={[""]}
              mode="horizontal"
              items={items(false)}
            />
          </div>
          <GithubOutlined
            style={{
              fontSize: "1.5em",
            }}
            onClick={() => {
              window.open(
                "https://github.com/K-H-Rayhan/react-dnd-menu-builder"
              );
            }}
          />
        </Header>
        <Content style={{ margin: "0 16px" }}>
          <div
            style={{
              padding,
              marginTop,
              minHeight,
              background,
              borderRadius,
            }}
          >
            <MenuBuilder menus={menus} handleMenus={setMenus} />
          </div>
        </Content>
        <Tooltip title="Contact me">
          <FloatButton
            style={{
              backgroundColor: "#1890ff",
            }}
            type="primary"
            icon={<ContactsFilled />}
            onClick={() => {
              window.open("https://linktr.ee/khrayhan");
            }}
          />
        </Tooltip>
      </Layout>
    </Layout>
  );
};

export default App;

const generateMenuWithChildren = (menus, showIcon) => {
  return menus.map((menu) => {
    return {
      key.id,
      label.name,
      icon ? (
        <h3
          style={{
            fontSize: "1.5em",
          }}
        >
          &#8226;
        </h3>
      ) : (
        <></>
      ),
      children?.children && menu?.children.length
          ? generateMenuWithChildren(menu.children, showIcon)
          ,
    };
  });
};

const getAllKeys = (menus) => {
  return menus.reduce((acc, menu) => {
    acc.push(menu.id);
    if (menu?.children && menu.children.length) {
      acc.push(...getAllKeys(menu.children));
    }
    return acc;
  }, []);
};

const initMenus = [
  {
    id: "Home",
    name: "Home",
    href: "/home",
  },
  {
    id: "Collections",
    href: "/collections",
    name: "Collections",
    children
      {
        id: "Spring",
        name: "Spring",
        href: "/spring",
      },
      {
        id: "Summer",
        name: "Summer",
        href: "/summer",
      },
      {
        id: "Fall",
        name: "Fall",
        href: "/fall",
      },
      {
        id: "Winter",
        name: "Winter",
        href: "/winter",
      },
    ],
  },
  {
    id: "About Us",
    name: "About Us",
    href: "/about-us",
  },
  {
    id: "My Account",
    name: "My Account",
    href: "/my-account",
    children
      {
        id: "Addresses",
        name: "Addresses",
        href: "/addresses",
      },
      {
        id: "Order History",
        name: "Order History",
        href: "/order-history",
      },
    ],
  },
];
// get typescript type from menus
type Menu = (typeof initMenus)[number];
