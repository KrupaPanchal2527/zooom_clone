"use client";

import React from "react";
import HomeCard from "./HomeCard";
import { useRouter } from "next/navigation";
import MeetingModal from "./MeetingModal";
import { useUser } from "@clerk/nextjs";
import { Call, useStreamVideoClient } from "@stream-io/video-react-sdk";
import { useToast } from "@/components/ui/use-toast";

const MeetingTypeList = () => {
  const router = useRouter();
  const { user } = useUser();
  const client = useStreamVideoClient();
  const { toast } = useToast();

  const [meetingState, setMeetingState] = React.useState<
    "isScheduleMeeting" | "isJoiningMeeting" | "isInstantMeeting" | undefined
  >();
  const [values, setValues] = React.useState({
    dateTime: new Date(),
    link: "",
    description: "",
  });
  const [callDetails, setCallDetails] = React.useState<Call>();

  const handleCreateMeeting = async () => {
    if (!client || !user) return;

    try {
      if (!values.dateTime) {
        toast({
          title: "Please select a date and time",
        });
        return;
      }

      const id = crypto.randomUUID();
      const call = client.call("default", id);

      if (!call) throw new Error("Failed to create call");

      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || "Instant meeting";

      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: { description },
        },
      });

      setCallDetails(call);

      if (!values.description) {
        router.push(`/meeting/${call.id}`);
      }
      toast({ title: "Meeting created!" });
    } catch (error) {
      toast({
        title: "Failed to create meeting",
      });
      console.log(error);
    }
  };

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => setMeetingState("isInstantMeeting")}
        className="bg-orange-1"
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="via invitation link"
        handleClick={() => setMeetingState("isJoiningMeeting")}
        className="bg-blue-1"
      />
      <HomeCard
        img="icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your meeting"
        handleClick={() => setMeetingState("isScheduleMeeting")}
        className="bg-purple-1"
      />
      <HomeCard
        img="icons/recordings.svg"
        title="View Recordings"
        description="Check out your recordings"
        handleClick={() => router.push("/recordings")}
        className="bg-yellow-1"
      />

      <MeetingModal
        isOpen={meetingState === "isInstantMeeting"}
        onClose={() => setMeetingState(undefined)}
        title="Start an instant meeting"
        className="text-center"
        buttonText="Start meeting"
        handleClick={handleCreateMeeting}
      />
    </section>
  );
};

export default MeetingTypeList;