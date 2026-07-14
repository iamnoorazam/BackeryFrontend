import { useState } from "react";
import { Link } from "react-router-dom";
import { Star, MessageSquare, Quote, User, ThumbsUp, ChevronRight, BadgeCheck, Sparkles, Heart, Clock, Send, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Spinner from "@/components/atoms/Spinner";
import { useFeedback, useCreateFeedback } from "@/hooks/useFeedback";
import { useAuth } from "@/store/authStore";
import { useToast } from "../store/Toast";

const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

const FeedbackPage = () => {
  const { user, isLoggedIn } = useAuth();
  const { toast } = useToast();
  const { data, isLoading } = useFeedback();
  const createFeedback = useCreateFeedback();

  const feedbacks = data?.feedbacks || [];
  const avgRating = data?.avgRating || 0;
  const totalReviews = data?.totalReviews || 0;

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast({ title: "Please login to submit feedback", variant: "destructive" });
      return;
    }
    if (rating === 0) {
      toast({ title: "Please select a rating", variant: "destructive" });
      return;
    }
    if (!comment.trim()) {
      toast({ title: "Please write a comment", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    createFeedback.mutate(
      { rating, comment: comment.trim() },
      {
        onSuccess: () => {
          toast({ title: "Feedback submitted! Thank you 🎉" });
          setRating(0);
          setComment("");
          setSubmitting(false);
        },
        onError: (err) => {
          toast({ title: err.response?.data?.message || "Failed to submit", variant: "destructive" });
          setSubmitting(false);
        },
      },
    );
  };

  const ratingDistribution = {};
  feedbacks.forEach((fb) => {
    ratingDistribution[fb.rating] = (ratingDistribution[fb.rating] || 0) + 1;
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl min-h-[420px] flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1920&q=80"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/60 to-stone-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/40 via-transparent to-transparent" />
        </div>
        <div className="relative w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium mb-5 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-orange-300" />
                We value your opinion
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Share Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-300 to-amber-300">Experience</span>
              </h1>
              <p className="text-white/60 mt-4 max-w-lg text-base md:text-lg leading-relaxed">
                Every review helps us serve you better. Tell us what you loved or what we can improve — your voice makes ApnaMart better.
              </p>
              <div className="flex flex-wrap items-center gap-5 mt-8">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`h-6 w-6 ${s <= Math.round(avgRating) ? "fill-orange-400 text-orange-400" : "fill-white/10 text-white/20"}`}
                    />
                  ))}
                </div>
                <span className="text-white font-bold text-3xl">{avgRating}</span>
                <span className="text-white/50 text-sm">
                  <span className="font-medium text-white/70">{totalReviews}</span> reviews
                </span>
              </div>
            </div>
            <div className="shrink-0 text-center md:text-right">
              <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-400/10 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageSquare className="h-12 w-12 md:h-16 md:w-16 text-orange-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 mb-12">
        {/* Rating Distribution Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[
            { label: "Total Reviews", value: totalReviews, icon: MessageSquare, color: "from-orange-500 to-amber-500" },
            { label: "Average Rating", value: avgRating, icon: Star, color: "from-amber-400 to-yellow-500" },
            { label: "5-Star Reviews", value: ratingDistribution[5] || 0, icon: Heart, color: "from-red-400 to-rose-500" },
            { label: "Rating Score", value: `${Math.round((avgRating / 5) * 100)}%`, icon: Smile, color: "from-green-400 to-emerald-500" },
          ].map((stat) => (
            <Card key={stat.label} className="border-stone-200/80 overflow-hidden hover:shadow-lg hover:border-orange-200/50 transition-all duration-300 group">
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold">{stat.label}</p>
                    <p className="text-xl md:text-2xl font-bold text-stone-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Feedback Form */}
          <div className="lg:col-span-2">
            <div className="sticky top-24">
              <Card className="border-stone-200/80 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
                {/* Form header with decorative top bar */}
                <div className="h-2 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-400" />
                <CardContent className="p-6 md:p-7">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-stone-900">Write a Review</h2>
                      <p className="text-xs text-stone-400">Share your experience with our community</p>
                    </div>
                  </div>

                  {!isLoggedIn ? (
                    <div className="text-center py-8 mt-4 bg-gradient-to-br from-stone-50 to-stone-100/80 rounded-2xl border border-stone-200/60">
                      <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-4">
                        <User className="h-7 w-7 text-stone-400" />
                      </div>
                      <p className="text-sm text-stone-500 mb-1 font-medium">Login to share your feedback</p>
                      <p className="text-xs text-stone-400 mb-4">Sign in to write a review and help others</p>
                      <Button asChild className="bg-stone-900 text-white hover:bg-stone-800 rounded-xl px-6">
                        <Link to={`/login?redirect=${encodeURIComponent("/feedback")}`}>
                          Login to Review
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                      {/* User info bar */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 border border-stone-100">
                        <Avatar className="w-9 h-9 ring-2 ring-orange-200">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-xs font-bold">
                            {user?.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold text-stone-900">{user?.name || "User"}</p>
                          <p className="text-[10px] text-stone-400">Sharing as customer</p>
                        </div>
                      </div>

                      {/* Stars */}
                      <div>
                        <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-2.5">
                          Your Rating
                        </label>
                        <div className="flex items-center gap-1.5 p-3 rounded-xl bg-stone-50 border border-stone-100">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="transition-all duration-150 hover:scale-110 active:scale-90"
                            >
                              <Star
                                className={`h-7 w-7 transition-all duration-200 ${
                                  star <= (hoverRating || rating)
                                    ? "fill-orange-400 text-orange-400 drop-shadow-sm"
                                    : "text-stone-300 hover:text-orange-300"
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-sm font-medium text-stone-500 ml-2">
                            {hoverRating || rating
                              ? RATING_LABELS[hoverRating || rating]
                              : "Rate us"}
                          </span>
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="text-xs font-semibold text-stone-600 uppercase tracking-wider block mb-2.5">
                          Your Feedback
                        </label>
                        <div className="relative">
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your experience... what did you love? what can we improve?"
                            rows={4}
                            className="w-full border border-stone-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all duration-200 resize-none bg-white/80 placeholder:text-stone-400"
                            maxLength={500}
                          />
                          <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            <span className={`text-[10px] font-medium ${comment.length > 450 ? "text-orange-500" : "text-stone-400"}`}>
                              {comment.length}/500
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting || createFeedback.isLoading}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white border-0 shadow-md shadow-orange-200/50 hover:shadow-lg hover:shadow-orange-300/40 transition-all duration-300 rounded-xl py-6"
                      >
                        {submitting || createFeedback.isLoading ? (
                          <span className="flex items-center gap-2">
                            <Spinner />
                            Submitting...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2">
                            <Send className="h-4 w-4" />
                            Submit Feedback
                          </span>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Feedback List */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <Spinner />
                  <p className="text-sm text-stone-400">Loading reviews...</p>
                </div>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-3xl border border-stone-200/60">
                <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-5">
                  <MessageSquare className="h-9 w-9 text-stone-400" />
                </div>
                <p className="text-stone-500 font-semibold text-lg">No reviews yet</p>
                <p className="text-stone-400 text-sm mt-1 max-w-xs mx-auto">
                  Be the first to share your experience and help our community!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-stone-500">
                    Showing <span className="font-semibold text-stone-700">{feedbacks.length}</span> reviews
                  </p>
                </div>
                {feedbacks.map((fb, i) => (
                  <Card
                    key={fb._id}
                    className="border-stone-200/80 hover:border-orange-200/60 hover:shadow-md transition-all duration-300 animate-fade-in group"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <CardContent className="p-5 md:p-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-11 h-11 ring-2 ring-orange-100 shrink-0">
                          <AvatarImage src={fb.user?.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-orange-400 to-amber-500 text-white text-xs font-bold">
                            {fb.user?.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-stone-900 text-sm">
                                  {fb.user?.name || "Anonymous"}
                                </p>
                                <BadgeCheck className="h-4 w-4 text-orange-500" />
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`h-3.5 w-3.5 ${
                                        s <= fb.rating
                                          ? "fill-orange-400 text-orange-400"
                                          : "text-stone-200"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[10px] text-stone-400 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(fb.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <Badge className="text-[10px] bg-orange-50 text-orange-600 border-orange-200 font-medium rounded-full px-3">
                              Verified
                            </Badge>
                          </div>

                          <div className="mt-3.5 relative">
                            <Quote className="h-5 w-5 text-orange-200 absolute -top-0.5 -left-0.5" />
                            <div className="bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-2xl p-4 pl-8 border border-stone-100">
                              <p className="text-sm text-stone-700 leading-relaxed">
                                {fb.comment}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
