import React, { lazy, Suspense, useEffect, useRef, useState } from "react";

import { useList } from "@refinedev/core";

import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import FullCalendar from "@fullcalendar/react";
import { Button, Card, Grid, Radio } from "antd";
import dayjs from "dayjs";

import { Text } from "@/components";
import { Event } from "@/interfaces";

import styles from "./index.module.css";

const FullCalendarWrapper = lazy(() => import("./full-calendar"));

type CalendarProps = {
    categoryId?: string[];
    onClickEvent?: (event: Event) => void;
};

export const Calendar: React.FC<CalendarProps> = ({
    categoryId,
    onClickEvent,
}) => {
    const calendarRef = useRef<FullCalendar>(null);
    const [title, setTitle] = useState(
        calendarRef.current?.getApi().view.title,
    );
    const { md } = Grid.useBreakpoint();

    useEffect(() => {
        if (md) {
            calendarRef.current?.getApi().changeView("dayGridMonth");
        } else {
            calendarRef.current?.getApi().changeView("listMonth");
        }
    }, [md]);

    const { data } = useList<Event>({
        pagination: {
            mode: "off",
        },
        filters: [
            {
                field: "category.id",
                operator: "in",
                value: categoryId?.length ? categoryId : undefined,
            },
        ],
        meta: {
            fields: [
                "id",
                "title",
                "description",
                "startDate",
                "endDate",
                "color",
                "createdAt",
                {
                    createdBy: ["id", "name"],
                },
                {
                    category: ["id", "title"],
                },
            ],
        },
    });

    const events = (data?.data ?? []).map(
        ({ id, title, startDate, endDate, color }) => ({
            id: id,
            title: title,
            start: startDate,
            end: endDate,
            color: color,
            allDay:
                dayjs(endDate).utc().diff(dayjs(startDate).utc(), "hours") >=
                23,
        }),
    );

    return (
        <Card>
            <div className={styles.calendar_header}>
                <div className={styles.actions}>
                    <Button
                        onClick={() => {
                            calendarRef.current?.getApi().prev();
                        }}
                        shape="circle"
                        icon={<LeftOutlined />}
                    />
                    <Button
                        onClick={() => {
                            calendarRef.current?.getApi().next();
                        }}
                        shape="circle"
                        icon={<RightOutlined />}
                    />
                    <Text className={styles.title} size="lg">
                        {title}
                    </Text>
                </div>

                <Radio.Group value={calendarRef.current?.getApi().view.type}>
                    {[
                        {
                            label: "Month",
                            desktopView: "dayGridMonth",
                            mobileView: "listMonth",
                        },
                        {
                            label: "Week",
                            desktopView: "timeGridWeek",
                            mobileView: "listWeek",
                        },
                        {
                            label: "Day",
                            desktopView: "timeGridDay",
                            mobileView: "listDay",
                        },
                    ].map(({ label, desktopView, mobileView }) => {
                        const view = md ? desktopView : mobileView;
                        return (
                            <Radio.Button
                                key={label}
                                value={view}
                                onClick={() => {
                                    calendarRef.current
                                        ?.getApi()
                                        .changeView(view);
                                }}
                            >
                                {label}
                            </Radio.Button>
                        );
                    })}
                    {md && (
                        <Radio.Button
                            value="listMonth"
                            onClick={() => {
                                calendarRef.current
                                    ?.getApi()
                                    .changeView("listMonth");
                            }}
                        >
                            List
                        </Radio.Button>
                    )}
                </Radio.Group>
            </div>
            <Suspense>
                <FullCalendarWrapper
                    {...{ calendarRef, events, onClickEvent, setTitle }}
                />
            </Suspense>
        </Card>
    );
};
